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
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const distDir = path.join(frontendRoot, "dist");
const previewPort = Number(process.env.PRERENDER_PREVIEW_PORT || 4173);
const previewHost = process.env.PRERENDER_PREVIEW_HOST || "127.0.0.1";
const apiUrl = (process.env.PRERENDER_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const previewBase = `http://${previewHost}:${previewPort}`;

const { CURRENT_RANKING_YEAR, rankingsYearPath } = await import(
  pathToFileURL(path.join(frontendRoot, "src", "config", "rankings.js")).href
);

const STATIC_ROUTES = [
  "/",
  "/universitetlar",
  "/reyting",
  rankingsYearPath(CURRENT_RANKING_YEAR),
  "/maqolalar",
  "/yangiliklar",
  "/sayt-xaritasi",
  "/metodologiya",
  "/haqida",
  "/aloqa",
  "/xato-xabar",
  "/taqqoslash",
  "/foydalanish-shartlari",
  "/maxfiylik-siyosati",
  "/sharh-qoidalari",
  "/ishonch-xavfsizlik",
  "/savollar-javob",
  "/ru",
  "/stipendiyalar",
  "/qabul-qollanmasi",
  "/hamkorlar",
  "/yo-nalishlar",
  "/shahar/toshkent",
  "/shahar/samarqand",
  "/shahar/buxoro",
  "/shahar/andijon",
  "/shahar/namangan",
  "/shahar/fargona",
  "/shahar/nukus",
  "/shahar/qarshi",
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
    const universities = [];
    let page = 1;
    let totalPages = 1;
    do {
      const payload = await fetchJson(
        `${apiUrl}/api/public/universities/?page=${page}&page_size=48&sort=name`
      );
      universities.push(...(Array.isArray(payload) ? payload : payload?.results ?? []));
      totalPages = payload?.total_pages || 1;
      page += 1;
    } while (page <= totalPages && page <= 20);

    if (universities.length > 0) {
      for (const item of universities) {
        const base = `/universitet/${item.slug}`;
        routes.push(base);
        // Reviews silo always prerendered (nav CTA even when empty; page is noindex if empty).
        routes.push(`${base}/sharhlari`);
        if ((item.faculty_count ?? 0) > 0) {
          routes.push(`${base}/fakultetlar`);
        }
        if ((item.admission_count ?? 0) > 0) {
          routes.push(`${base}/qabul`);
        }
      }
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
    const articles = await fetchJson(`${apiUrl}/api/public/articles/?kind=guide`);
    const list = Array.isArray(articles) ? articles : articles?.results ?? [];
    if (list.length > 0) {
      routes.push(...list.map((item) => `/maqolalar/${item.slug}`));
    }
  } catch (error) {
    failures.push(`articles: ${error.message}`);
    console.warn("[prerender] Maqolalar yuklanmadi:", error.message);
  }

  try {
    const news = await fetchJson(`${apiUrl}/api/public/articles/?kind=news`);
    const list = Array.isArray(news) ? news : news?.results ?? [];
    if (list.length > 0) {
      routes.push(...list.map((item) => `/yangiliklar/${item.slug}`));
    }
  } catch (error) {
    failures.push(`news: ${error.message}`);
    console.warn("[prerender] Yangiliklar yuklanmadi:", error.message);
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

  let html = await page.content();
  // Phase 4 marker so verify / ops can assert HTML-first snapshots.
  if (!html.includes("myuni-ssg")) {
    html = html.replace(
      "<head>",
      '<head>\n    <!-- myuni-ssg:build -->\n    <meta name="myuni-render" content="ssg" />'
    );
  }
  const outputFile = routeToOutputFile(route);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html, "utf8");
  console.log(`[prerender] ${route} -> ${path.relative(frontendRoot, outputFile)}`);
}

async function mapPool(items, concurrency, worker) {
  const results = [];
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

async function main() {
  ensureDistExists();

  const spaShellPath = path.join(distDir, "spa.html");
  const viteIndexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(viteIndexPath)) {
    throw new Error("dist/index.html topilmadi — avval vite build.");
  }
  // Preserve CSR shell BEFORE overwriting index.html with home SSG.
  fs.copyFileSync(viteIndexPath, spaShellPath);
  console.log("[prerender] CSR shell saqlandi: dist/spa.html");

  const dynamicRoutes = await fetchDynamicRoutes();
  const routes = [...STATIC_ROUTES, ...dynamicRoutes];
  const concurrency = Math.max(1, Number(process.env.PRERENDER_CONCURRENCY || 3));
  console.log(
    `[prerender] ${routes.length} ta sahifa (${dynamicRoutes.length} ta dinamik), concurrency=${concurrency}`
  );

  const preview = await startPreviewServer();
  await waitForServerReady(`${previewBase}/`);

  const browser = await chromium.launch({ headless: true });

  try {
    await mapPool(routes, concurrency, async (route, index) => {
      const page = await browser.newPage();
      try {
        await prerenderRoute(page, route, index, routes.length);
      } finally {
        await page.close();
      }
    });

    if (!fs.existsSync(spaShellPath)) {
      throw new Error("dist/spa.html yo'qoldi — Phase 4 fallback buzilgan.");
    }
    const spaHtml = fs.readFileSync(spaShellPath, "utf8");
    if (spaHtml.includes('name="myuni-render" content="ssg"')) {
      throw new Error("dist/spa.html SSG home bilan ifloslangan — CSR shell qayta yozilishi kerak.");
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      apiUrl,
      mode: "ssg",
      phase: 4,
      spaShell: "spa.html",
      concurrency,
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
