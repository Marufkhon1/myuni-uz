import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

const COMPONENT_ROOT_PREFIXES = [
  "UniversityAvatar",
  "UniversityIdentity",
  "ui/",
  "reviews/",
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p, out);
    } else if (/\.(jsx?)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

function fixComponentAliasPaths(content) {
  let next = content;
  for (const prefix of COMPONENT_ROOT_PREFIXES) {
    next = next.replaceAll(`"@/${prefix}`, `"@/components/${prefix}`);
    next = next.replaceAll(`'@/${prefix}`, `'@/components/${prefix}`);
  }
  return next;
}

function fixSiblingHookImports(content) {
  return content.replace(
    /from (["'])\.\.\/(use[A-Za-z0-9]+\.js)\1/g,
    'from $1@/hooks/$2$1'
  );
}

const targets = [
  join(root, "components/dashboard/compare"),
  join(root, "components/dashboard/popular"),
  join(root, "hooks/dashboard"),
];

for (const dir of targets) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    let next = fixComponentAliasPaths(src);
    if (file.includes(`${join("hooks", "dashboard")}`)) {
      next = fixSiblingHookImports(next);
    }
    if (next !== src) {
      writeFileSync(file, next, "utf8");
      console.log("fixed", file.slice(root.length + 1));
    }
  }
}
