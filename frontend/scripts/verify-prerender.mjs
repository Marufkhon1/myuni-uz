/**
 * Prerender natijasini tekshiradi (B5 — production smoke test).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const manifestPath = path.join(distDir, "prerender-manifest.json");

const MIN_TOTAL_ROUTES = Number(process.env.PRERENDER_MIN_ROUTES || 40);

const REQUIRED_FILES = [
  "index.html",
  path.join("universitetlar", "index.html"),
  path.join("savollar-javob", "index.html"),
  path.join("universitet", "tdiu", "index.html"),
];

const SEO_PATTERNS = ['rel="canonical"', "application/ld+json", 'data-seo-ready="true"'];

function assertFileContains(filePath, patterns, label) {
  const absolutePath = path.join(distDir, filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`[verify-prerender] ${label}: ${filePath} topilmadi`);
  }
  const html = fs.readFileSync(absolutePath, "utf8");
  for (const pattern of patterns) {
    if (!html.includes(pattern)) {
      throw new Error(`[verify-prerender] ${label}: "${pattern}" ${filePath} ichida yo'q`);
    }
  }
}

if (!fs.existsSync(manifestPath)) {
  throw new Error("[verify-prerender] dist/prerender-manifest.json topilmadi.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const routes = Array.isArray(manifest.routes) ? manifest.routes : [];

if (routes.length < MIN_TOTAL_ROUTES) {
  throw new Error(
    `[verify-prerender] Kamida ${MIN_TOTAL_ROUTES} ta yo'l kutilgan, ${routes.length} ta topildi. Backend build vaqtida ishlayotganini tekshiring.`
  );
}

for (const file of REQUIRED_FILES) {
  assertFileContains(file, SEO_PATTERNS, "SEO snapshot");
}

console.log(`[verify-prerender] ${REQUIRED_FILES.length} ta asosiy sahifa + ${routes.length} ta yo'l — OK.`);
