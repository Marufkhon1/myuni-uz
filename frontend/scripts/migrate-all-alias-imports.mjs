import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, out);
    } else if (/\.(jsx?)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

function migrateDeepRelativeImports(content) {
  let next = content.replace(
    /from (["'])\.\.\/\.\.\/\.\.\/([^"']+)\1/g,
    'from $1@/$2$1'
  );
  next = next.replace(/from (["'])\.\.\/\.\.\/([^"']+)\1/g, 'from $1@/$2$1');
  return next;
}

function migrateSingleRelativeImports(content) {
  return content.replace(/from (["'])\.\.\/([^"']+)\1/g, 'from $1@/$2$1');
}

for (const file of walk(join(root, "components"))) {
  const source = readFileSync(file, "utf8");
  const next = migrateDeepRelativeImports(source);
  if (next !== source) {
    writeFileSync(file, next, "utf8");
    console.log("components:", file.slice(root.length + 1));
  }
}

for (const file of walk(join(root, "pages"))) {
  const source = readFileSync(file, "utf8");
  const next = migrateSingleRelativeImports(source);
  if (next !== source) {
    writeFileSync(file, next, "utf8");
    console.log("pages:", file.slice(root.length + 1));
  }
}

for (const file of walk(join(root, "layouts"))) {
  const source = readFileSync(file, "utf8");
  const next = migrateSingleRelativeImports(source);
  if (next !== source) {
    writeFileSync(file, next, "utf8");
    console.log("layouts:", file.slice(root.length + 1));
  }
}

for (const file of walk(join(root, "context"))) {
  const source = readFileSync(file, "utf8");
  const next = migrateSingleRelativeImports(source);
  if (next !== source) {
    writeFileSync(file, next, "utf8");
    console.log("context:", file.slice(root.length + 1));
  }
}

for (const file of walk(join(root, "hooks"))) {
  const source = readFileSync(file, "utf8");
  const next = migrateDeepRelativeImports(migrateSingleRelativeImports(source));
  if (next !== source) {
    writeFileSync(file, next, "utf8");
    console.log("hooks:", file.slice(root.length + 1));
  }
}
