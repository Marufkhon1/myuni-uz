/**
 * Phase 4 Core Web Vitals / bundle budgets — fails CI when dist exceeds limits.
 *
 * Budgets are gzip-estimated (raw bytes × 0.33) for JS; raw bytes for CSS.
 * Tune via env: BUDGET_MAX_ENTRY_JS_KB, BUDGET_MAX_TOTAL_JS_KB, BUDGET_MAX_CSS_KB
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const assetsDir = path.join(distDir, "assets");

const MAX_ENTRY_JS_KB = Number(process.env.BUDGET_MAX_ENTRY_JS_KB || 280);
const MAX_TOTAL_JS_KB = Number(process.env.BUDGET_MAX_TOTAL_JS_KB || 1100);
const MAX_CSS_KB = Number(process.env.BUDGET_MAX_CSS_KB || 160);
const MAX_HTML_HOME_KB = Number(process.env.BUDGET_MAX_HTML_HOME_KB || 850);

function gzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}

function walkJsCss(dir) {
  if (!fs.existsSync(dir)) {
    return { js: [], css: [] };
  }
  const js = [];
  const css = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const nested = walkJsCss(full);
      js.push(...nested.js);
      css.push(...nested.css);
      continue;
    }
    if (name.endsWith(".js")) {
      js.push(full);
    } else if (name.endsWith(".css")) {
      css.push(full);
    }
  }
  return { js, css };
}

function kb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

const { js, css } = walkJsCss(assetsDir);
if (js.length === 0) {
  console.error("[budget] dist/assets ichida JS topilmadi — avval vite build qiling.");
  process.exit(1);
}

const jsStats = js.map((file) => {
  const raw = fs.readFileSync(file);
  return {
    file: path.relative(distDir, file),
    raw: raw.length,
    gzip: gzipSize(raw),
  };
});
jsStats.sort((a, b) => b.gzip - a.gzip);

const cssStats = css.map((file) => {
  const raw = fs.readFileSync(file);
  return {
    file: path.relative(distDir, file),
    raw: raw.length,
    gzip: gzipSize(raw),
  };
});

const totalJsGzip = jsStats.reduce((sum, row) => sum + row.gzip, 0);
const totalCssGzip = cssStats.reduce((sum, row) => sum + row.gzip, 0);
const largestEntry = jsStats[0];

const homeHtmlPath = path.join(distDir, "index.html");
let homeHtmlGzip = 0;
if (fs.existsSync(homeHtmlPath)) {
  homeHtmlGzip = gzipSize(fs.readFileSync(homeHtmlPath));
}

const failures = [];
if (kb(largestEntry.gzip) > MAX_ENTRY_JS_KB) {
  failures.push(
    `Largest JS gzip ${kb(largestEntry.gzip)} KB > ${MAX_ENTRY_JS_KB} KB (${largestEntry.file})`
  );
}
if (kb(totalJsGzip) > MAX_TOTAL_JS_KB) {
  failures.push(`Total JS gzip ${kb(totalJsGzip)} KB > ${MAX_TOTAL_JS_KB} KB`);
}
if (kb(totalCssGzip) > MAX_CSS_KB) {
  failures.push(`Total CSS gzip ${kb(totalCssGzip)} KB > ${MAX_CSS_KB} KB`);
}
if (homeHtmlGzip && kb(homeHtmlGzip) > MAX_HTML_HOME_KB) {
  failures.push(`Home HTML gzip ${kb(homeHtmlGzip)} KB > ${MAX_HTML_HOME_KB} KB`);
}

console.log("[budget] Phase 4 CWV proxy budgets");
console.log(`  largest JS: ${kb(largestEntry.gzip)} KB gzip  (${largestEntry.file})`);
console.log(`  total JS:   ${kb(totalJsGzip)} KB gzip  (${jsStats.length} files)`);
console.log(`  total CSS:  ${kb(totalCssGzip)} KB gzip`);
if (homeHtmlGzip) {
  console.log(`  home HTML:  ${kb(homeHtmlGzip)} KB gzip`);
}

const report = {
  generatedAt: new Date().toISOString(),
  limits: {
    maxEntryJsKb: MAX_ENTRY_JS_KB,
    maxTotalJsKb: MAX_TOTAL_JS_KB,
    maxCssKb: MAX_CSS_KB,
    maxHtmlHomeKb: MAX_HTML_HOME_KB,
  },
  largestEntry,
  totalJsGzip,
  totalCssGzip,
  homeHtmlGzip,
  ok: failures.length === 0,
  failures,
};
fs.writeFileSync(
  path.join(distDir, "budget-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);

if (failures.length > 0) {
  console.error("[budget] FAILED:");
  for (const line of failures) {
    console.error(`  - ${line}`);
  }
  process.exit(1);
}

console.log("[budget] OK");
