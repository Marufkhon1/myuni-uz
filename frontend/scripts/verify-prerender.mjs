/**
 * Prerender natijasini tekshiradi (B5 — production smoke test).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const manifestPath = path.join(distDir, "prerender-manifest.json");
const frontendRoot = path.join(__dirname, "..");

const { CURRENT_RANKING_YEAR } = await import(
  pathToFileURL(path.join(frontendRoot, "src", "config", "rankings.js")).href
);

const MIN_TOTAL_ROUTES = Number(process.env.PRERENDER_MIN_ROUTES || 40);
const liveRankingsRel = path.join("reyting", String(CURRENT_RANKING_YEAR), "index.html");

const REQUIRED_FILES = [
  "index.html",
  path.join("universitetlar", "index.html"),
  path.join("savollar-javob", "index.html"),
  path.join("universitet", "tdiu", "index.html"),
  path.join("universitet", "tdiu", "sharhlari", "index.html"),
  path.join("reyting", "index.html"),
  liveRankingsRel,
  path.join("xato-xabar", "index.html"),
  path.join("sayt-xaritasi", "index.html"),
  path.join("yangiliklar", "index.html"),
  path.join("taqqoslash", "index.html"),
  path.join("ru", "index.html"),
];

const SEO_PATTERNS = [
  'rel="canonical"',
  "application/ld+json",
  'data-seo-ready="true"',
  'name="myuni-render"',
  "myuni-ssg",
];

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

function assertOptionalSilo(filePath, patterns, label) {
  const absolutePath = path.join(distDir, filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`[verify-prerender] optional skip (empty silo): ${filePath}`);
    return;
  }
  assertFileContains(filePath, patterns, label);
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

assertFileContains(
  liveRankingsRel,
  ["Soft reyting", String(CURRENT_RANKING_YEAR)],
  "Phase 2 rankings year"
);
const liveHtml = fs.readFileSync(path.join(distDir, liveRankingsRel), "utf8");
if (!liveHtml.includes("ItemList") && !liveHtml.includes("tasdiqlangan sharh")) {
  throw new Error(
    `[verify-prerender] Phase 2 rankings year: ItemList yoki empty-state matni ${liveRankingsRel} ichida yo'q`
  );
}
assertFileContains(path.join("xato-xabar", "index.html"), ["Xato haqida xabar"], "Phase 2 report-error");
assertFileContains(path.join("reyting", "index.html"), ["Soft reyting"], "Phase 2 rankings hub");
assertFileContains(path.join("sayt-xaritasi", "index.html"), ["Sayt xaritasi"], "Phase 3 HTML sitemap");
assertFileContains(path.join("yangiliklar", "index.html"), ["Yangilik"], "Phase 3 news hub");
assertFileContains(
  path.join("universitet", "tdiu", "sharhlari", "index.html"),
  ["Sharh", "/universitet/tdiu/sharhlari"],
  "Phase 3 reviews silo"
);
assertOptionalSilo(
  path.join("universitet", "tdiu", "fakultetlar", "index.html"),
  [...SEO_PATTERNS, "Fakultet"],
  "Phase 3 faculties silo"
);
assertOptionalSilo(
  path.join("universitet", "tdiu", "qabul", "index.html"),
  [...SEO_PATTERNS, "Qabul"],
  "Phase 3 admission silo"
);
assertFileContains(path.join("taqqoslash", "index.html"), ["Taqqoslash", "myuni-ssg"], "Phase 4 compare SSG");
assertFileContains(path.join("ru", "index.html"), ["Русская", "noindex"], "Phase 4 RU locale hub");
assertFileContains(path.join("stipendiyalar", "index.html"), ["Stipendiya", "myuni-ssg"], "Phase 5 scholarships");
assertFileContains(path.join("qabul-qollanmasi", "index.html"), ["Qabul", "myuni-ssg"], "Phase 5 admission guide");
assertFileContains(path.join("yo-nalishlar", "index.html"), ["Yo", "myuni-ssg"], "Phase 5 programs");
assertFileContains(path.join("hamkorlar", "index.html"), ["Hamkor", "myuni-ssg"], "Phase 5 partners");
for (const [slug, label] of [
  ["toshkent", "Toshkent"],
  ["samarqand", "Samarqand"],
  ["buxoro", "Buxoro"],
  ["andijon", "Andijon"],
  ["namangan", "Namangan"],
  ["fargona", "Farg"],
  ["nukus", "Nukus"],
  ["qarshi", "Qarshi"],
]) {
  assertFileContains(
    path.join("shahar", slug, "index.html"),
    [label, "myuni-ssg"],
    `Phase 5 city ${slug}`
  );
}
const spaPath = path.join(distDir, "spa.html");
if (!fs.existsSync(spaPath)) {
  throw new Error("[verify-prerender] Phase 4: dist/spa.html yo'q");
}
const spaHtml = fs.readFileSync(spaPath, "utf8");
if (spaHtml.includes('name="myuni-render" content="ssg"')) {
  throw new Error("[verify-prerender] Phase 4: spa.html SSG bilan ifloslangan");
}
if (!spaHtml.includes('id="root"')) {
  throw new Error("[verify-prerender] Phase 4: spa.html CSR shell emas");
}

const homeHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
if (!homeHtml.includes('name="myuni-render" content="ssg"')) {
  throw new Error("[verify-prerender] Phase 4: home HTML myuni-render=ssg marker yo'q");
}
if (homeHtml.length < 12000) {
  throw new Error("[verify-prerender] Phase 4: home HTML juda yupqa — full SSG body kutiladi");
}

const sitemapHtml = fs.readFileSync(path.join(distDir, "sayt-xaritasi", "index.html"), "utf8");
if (!sitemapHtml.includes("/universitet/")) {
  throw new Error("[verify-prerender] Phase 3 HTML sitemap: universitet deep links yo'q");
}

if (manifest.spaShell !== "spa.html") {
  throw new Error("[verify-prerender] Phase 4: manifest.spaShell != spa.html");
}

console.log(
  `[verify-prerender] ${REQUIRED_FILES.length} ta asosiy sahifa + ${routes.length} ta yo'l — OK (Phase 4 spa.html + SSG).`
);
