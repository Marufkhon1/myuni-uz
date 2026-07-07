import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const dirs = [
  "components/dashboard",
  "components/dashboard/compare",
  "components/dashboard/popular",
  "pages/dashboard",
  "hooks/dashboard",
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

const popularParent = join(root, "components/dashboard/popular");

for (const rel of dirs) {
  const dir = join(root, rel);
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    let next = src.replace(
      /from (["'])\.\.\/\.\.\/\.\.\/([^"']+)\1/g,
      'from $1@/$2$1'
    );

    const isDashboardNested = rel.startsWith("components/dashboard/");
    if (isDashboardNested) {
      next = next.replace(
        /from (["'])\.\.\/\.\.\/([^"']+)\1/g,
        'from $1@/components/$2$1'
      );
    } else {
      next = next.replace(
        /from (["'])\.\.\/\.\.\/([^"']+)\1/g,
        'from $1@/$2$1'
      );
    }

    next = next.replace(
      /from (["'])\.\.\/(use[A-Za-z0-9]+\.js)\1/g,
      'from $1@/hooks/$2$1'
    );

    if (file.startsWith(popularParent)) {
      next = next.replace(
        /from (["'])\.\.\/UserAvatar\.jsx\1/g,
        'from $1@/components/dashboard/UserAvatar.jsx$1'
      );
    }

    if (next !== src) {
      writeFileSync(file, next, "utf8");
      console.log("updated", file.slice(root.length + 1));
    }
  }
}
