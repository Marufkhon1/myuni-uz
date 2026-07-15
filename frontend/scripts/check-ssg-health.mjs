/**
 * Phase 4 production gate — fail closed if HTML-first SSG is incomplete.
 *
 * Usage (from frontend/):
 *   node scripts/check-ssg-health.mjs
 *
 * Env:
 *   SSG_DIST_DIR — default ../dist relative to this script
 *   SSG_REQUIRE_MIN_ROUTES — default 40
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(
  process.env.SSG_DIST_DIR || path.join(__dirname, "..", "dist")
);
const minRoutes = Number(process.env.SSG_REQUIRE_MIN_ROUTES || 40);

function fail(message) {
  console.error(`[ssg-health] FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`[ssg-health] OK: ${message}`);
}

if (!fs.existsSync(distDir)) {
  fail(`dist yo'q: ${distDir}`);
}

const spaPath = path.join(distDir, "spa.html");
const homePath = path.join(distDir, "index.html");
const manifestPath = path.join(distDir, "prerender-manifest.json");

if (!fs.existsSync(spaPath)) {
  fail("dist/spa.html yo'q — nginx CSR fallback ishlamaydi");
}
if (!fs.existsSync(homePath)) {
  fail("dist/index.html yo'q");
}
if (!fs.existsSync(manifestPath)) {
  fail("dist/prerender-manifest.json yo'q — SSG ishlamagan");
}

const spaHtml = fs.readFileSync(spaPath, "utf8");
const homeHtml = fs.readFileSync(homePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (spaHtml.includes('name="myuni-render" content="ssg"')) {
  fail("spa.html SSG home bilan ifloslangan");
}
if (!spaHtml.includes('<div id="root"></div>') && !spaHtml.includes('id="root"')) {
  fail("spa.html ichida #root yo'q — CSR shell emas");
}
if (!homeHtml.includes('name="myuni-render" content="ssg"')) {
  fail("index.html SSG marker yo'q");
}
if (homeHtml.length < 12000) {
  fail("index.html juda yupqa — full SSG body emas");
}
if (!Array.isArray(manifest.routes) || manifest.routes.length < minRoutes) {
  fail(`manifest routes ${manifest.routes?.length ?? 0} < ${minRoutes}`);
}
if (manifest.spaShell !== "spa.html") {
  fail("manifest.spaShell != spa.html");
}

const sampleRoutes = ["/", "/haqida", "/universitetlar", "/taqqoslash"];
for (const route of sampleRoutes) {
  if (!manifest.routes.includes(route)) {
    fail(`manifest da yo'q: ${route}`);
  }
}

ok(`spa.html + SSG home + ${manifest.routes.length} routes`);
process.exit(0);
