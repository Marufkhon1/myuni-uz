/**
 * Build dan keyin ochiq sahifalarni statik HTML sifatida saqlaydi (B5 — prerender).
 *
 * Ishlatish:
 *   npm run build
 *   npm run prerender
 *
 * Dinamik yo'llar uchun backend API kerak (PRERENDER_API_URL, default: http://127.0.0.1:8000).
 * CI/production: PRERENDER_REQUIRE_API=1 o'rnatilsa, API ishlamasa build xato beradi.
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
const previewPort = Number(process.env.PRERENDER_PREVIEW_PORT || 4173);
const previewHost = process.env.PRERENDER_PREVIEW_HOST || "127.0.0.1";
const apiUrl = (process.env.PRERENDER_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const previewBase = `http://${previewHost}:${previewPort}`;

const STATIC_ROUTES = [
  "/",
  "/universitetlar",
  "/maqolalar",
  "/metodologiya",
  "/taqqoslash",
  "/foydalanish-shartlari",
  "/maxfiylik-siyosati",
  "/sharh-qoidalari",
  "/ishonch-xavfsizlik",
  "/savollar-javob",
];

function ensureDistExists() {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ topilmadi. Avval `npm run build` ni ishga tushiring.");
  }
}

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
        reject(new Error(`Preview server ${url} ga ulanib bo'lmadi.`));
        return;
      }
      setTimeout(tick, 400);
    };

    tick();
  });
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npm",
      ["run", "preview", "--", "--host", previewHost, "--port", String(previewPort), "--strictPort"],
      {
        cwd: frontendRoot,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.platform === "win32",
        env: {
          ...process.env,
          PRERENDER_API_URL: apiUrl,
        },
      }
    );

    let settled = false;
    const onReady = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(child);
    };

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("Local:") || text.includes(String(previewPort))) {
        onReady();
      }
    });
    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes(String(previewPort))) {
        onReady();
      }
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (!settled) {
        reject(new Error(`vite preview ${code} kod bilan yakunlandi.`));
      }
    });

    setTimeout(onReady, 2500);
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} — HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchDynamicRoutes() {
  const routes = [];
  const requireApi = process.env.PRERENDER_REQUIRE_API === "1";
  const failures = [];

  try {
    const payload = await fetchJson(`${apiUrl}/api/public/universities/`);
    const universities = Array.isArray(payload) ? payload : payload?.results ?? [];
    if (universities.length > 0) {
      routes.push(...universities.map((item) => `/universitet/${item.slug}`));
    }
  } catch (error) {
    failures.push(`universities: ${error.message}`);
    console.warn("[prerender] Universitetlar yuklanmadi:", error.message);
  }

  try {
    const faqPayload = await fetchJson(`${apiUrl}/api/public/faq/`);
    const faqItems = faqPayload?.items ?? [];
    if (faqItems.length > 0) {
      routes.push(...faqItems.map((item) => `/savollar-javob/${item.slug}`));
    }
  } catch (error) {
    failures.push(`faq: ${error.message}`);
    console.warn("[prerender] FAQ yuklanmadi:", error.message);
  }

  try {
    const articles = await fetchJson(`${apiUrl}/api/public/articles/`);
    if (Array.isArray(articles) && articles.length > 0) {
      routes.push(...articles.map((item) => `/maqolalar/${item.slug}`));
    }
  } catch (error) {
    failures.push(`articles: ${error.message}`);
    console.warn("[prerender] Maqolalar yuklanmadi:", error.message);
  }

  if (requireApi && failures.length > 0) {
    throw new Error(
      `PRERENDER_REQUIRE_API=1: dinamik yo'llar yuklanmadi (${failures.join("; ")}). Backend ${apiUrl} ishlayotganini tekshiring.`
    );
  }

  return routes;
}

function routeToOutputFile(route) {
  if (route === "/") {
    return path.join(distDir, "index.html");
  }
  const normalized = route.replace(/^\/+/, "").replace(/\/+$/, "");
  return path.join(distDir, normalized, "index.html");
}

async function prerenderRoute(page, route, index, total) {
  const url = route === "/" ? `${previewBase}/` : `${previewBase}${route}`;
  console.log(`[prerender] (${index + 1}/${total}) ${route}`);
  await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.waitForSelector('[data-seo-ready="true"]', {
    timeout: 30000,
    state: "attached",
  });
  await page.waitForSelector('script[type="application/ld+json"]', {
    timeout: 15000,
    state: "attached",
  });
  await page.waitForSelector('link[rel="canonical"]', {
    timeout: 15000,
    state: "attached",
  });

  const html = await page.content();
  const outputFile = routeToOutputFile(route);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html, "utf8");
  console.log(`[prerender] ${route} -> ${path.relative(frontendRoot, outputFile)}`);
}

async function main() {
  ensureDistExists();

  const dynamicRoutes = await fetchDynamicRoutes();
  const routes = [...STATIC_ROUTES, ...dynamicRoutes];
  console.log(`[prerender] ${routes.length} ta sahifa (${dynamicRoutes.length} ta dinamik)`);

  const preview = await startPreviewServer();
  await waitForServerReady(`${previewBase}/`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const [index, route] of routes.entries()) {
      await prerenderRoute(page, route, index, routes.length);
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      apiUrl,
      staticRoutes: STATIC_ROUTES.length,
      dynamicRoutes: dynamicRoutes.length,
      totalRoutes: routes.length,
      routes,
    };
    fs.writeFileSync(
      path.join(distDir, "prerender-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8"
    );
    console.log(`[prerender] Manifest: dist/prerender-manifest.json (${routes.length} ta yo'l)`);
  } finally {
    await browser.close();
    preview.kill("SIGTERM");
  }

  console.log("[prerender] Tayyor.");
}

main().catch((error) => {
  console.error("[prerender] Xato:", error.message);
  process.exit(1);
});
