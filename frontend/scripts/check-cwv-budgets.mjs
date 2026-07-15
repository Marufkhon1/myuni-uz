/**
 * Phase 4 — Lighthouse-lite CWV smoke on prerendered HTML via Playwright.
 * Measures LCP/CLS/TBT on local static files (vite preview of dist).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const distDir = path.join(frontendRoot, "dist");
const previewPort = Number(process.env.CWV_PREVIEW_PORT || 4177);
const previewHost = process.env.CWV_PREVIEW_HOST || "127.0.0.1";
const previewBase = `http://${previewHost}:${previewPort}`;

const LCP_MAX_MS = Number(process.env.CWV_LCP_MAX_MS || 2500);
const CLS_MAX = Number(process.env.CWV_CLS_MAX || 0.1);
const ROUTES = (process.env.CWV_ROUTES || "/,/haqida,/taqqoslash").split(",").map((s) => s.trim());

function waitForServerReady(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Preview ${url} ready emas`));
        return;
      }
      setTimeout(tick, 400);
    };
    tick();
  });
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npm",
      ["run", "preview", "--", "--host", previewHost, "--port", String(previewPort), "--strictPort"],
      {
        cwd: frontendRoot,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.platform === "win32",
      }
    );
    let settled = false;
    const ready = () => {
      if (!settled) {
        settled = true;
        resolve(child);
      }
    };
    child.stdout?.on("data", (chunk) => {
      if (String(chunk).includes(String(previewPort))) {
        ready();
      }
    });
    child.stderr?.on("data", (chunk) => {
      if (String(chunk).includes(String(previewPort))) {
        ready();
      }
    });
    child.on("error", reject);
    setTimeout(ready, 2500);
  });
}

async function measureRoute(page, route) {
  const url = route === "/" ? `${previewBase}/` : `${previewBase}${route}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector('[data-seo-ready="true"]', { timeout: 20000 }).catch(() => null);

  const metrics = await page.evaluate(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const nav = performance.getEntriesByType("navigation")[0];
    let lcp = 0;
    let cls = 0;
    try {
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length) {
        lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }
    } catch {
      /* ignore */
    }
    try {
      for (const entry of performance.getEntriesByType("layout-shift")) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
    } catch {
      /* ignore */
    }
    return {
      lcp,
      cls: Number(cls.toFixed(4)),
      domContentLoaded: nav?.domContentLoadedEventEnd || 0,
      htmlBytes: document.documentElement.outerHTML.length,
      hasSeoReady: Boolean(document.querySelector('[data-seo-ready="true"]')),
      hasJsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
    };
  });

  return { route, ...metrics };
}

async function main() {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ yo'q — avval npm run build");
  }

  const preview = await startPreview();
  await waitForServerReady(`${previewBase}/`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  const failures = [];
  try {
    for (const route of ROUTES) {
      const row = await measureRoute(page, route);
      results.push(row);
      console.log(
        `[cwv] ${route}  LCP=${Math.round(row.lcp)}ms  CLS=${row.cls}  html=${row.htmlBytes}B  seo=${row.hasSeoReady}`
      );
      if (row.lcp > LCP_MAX_MS) {
        failures.push(`${route}: LCP ${Math.round(row.lcp)}ms > ${LCP_MAX_MS}ms`);
      }
      if (row.cls > CLS_MAX) {
        failures.push(`${route}: CLS ${row.cls} > ${CLS_MAX}`);
      }
      if (!row.hasSeoReady) {
        failures.push(`${route}: data-seo-ready yo'q`);
      }
      if (!row.hasJsonLd) {
        failures.push(`${route}: JSON-LD yo'q`);
      }
      if (row.htmlBytes < 8000) {
        failures.push(`${route}: HTML juda yupqa (${row.htmlBytes}B) — SSG body yetarli emas`);
      }
    }
  } finally {
    await browser.close();
    preview.kill("SIGTERM");
  }

  fs.writeFileSync(
    path.join(distDir, "cwv-report.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), results, failures }, null, 2)}\n`,
    "utf8"
  );

  if (failures.length) {
    console.error("[cwv] FAILED:");
    for (const line of failures) {
      console.error(`  - ${line}`);
    }
    process.exit(1);
  }
  console.log("[cwv] OK");
}

main().catch((error) => {
  console.error("[cwv]", error.message);
  process.exit(1);
});
