#!/usr/bin/env node
// Reads every *.colorset in an Xcode asset catalog and writes a TypeScript
// file with light/dark hex values.
//
// Usage: node generate_colors.js <path/to/Assets.xcassets> [output.ts]
// Default output: src/theme/colors.ts

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
  console.error("⚠️  Missing source folder!");
  console.log(
    "Usage: node generate_colors.js <path/to/Assets.xcassets> [output.ts]",
  );
  process.exit(1);
}

const SOURCE = path.resolve(args[0]);
let OUTPUT = path.resolve(args[1] || "src/theme/colors.ts");

// If the output is a folder (or has no file extension), write colors.ts inside it
if (
  (fs.existsSync(OUTPUT) && fs.statSync(OUTPUT).isDirectory()) ||
  path.extname(OUTPUT) === ""
) {
  OUTPUT = path.join(OUTPUT, "colors.ts");
}

if (!fs.existsSync(SOURCE) || !fs.statSync(SOURCE).isDirectory()) {
  console.error(`❌ Error: Directory does not exist at ${SOURCE}`);
  process.exit(1);
}

function findColorSets(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.endsWith(".colorset")) list.push(full);
    else findColorSets(full, list);
  }
  return list;
}

// Xcode stores components as "0.608" (float 0-1), "155" (int 0-255) or "0x9B" (hex).
function parseComponent(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  if (/^0x/i.test(s)) return parseInt(s, 16);
  const n = parseFloat(s);
  if (Number.isNaN(n)) return null;
  return s.includes(".") ? Math.round(n * 255) : Math.round(n);
}

const hex2 = (n) =>
  Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0").toUpperCase();

function toHex(color) {
  const c = color && color.components;
  if (!c) return null;

  let r, g, b;
  if (c.white !== undefined) {
    r = g = b = parseComponent(c.white);
  } else {
    r = parseComponent(c.red);
    g = parseComponent(c.green);
    b = parseComponent(c.blue);
  }
  if ([r, g, b].some((v) => v === null || v === undefined)) return null;

  const alpha = c.alpha !== undefined ? parseFloat(c.alpha) : 1;
  let hex = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  if (alpha < 1) hex += hex2(Math.round(alpha * 255)); // React Native uses #RRGGBBAA
  return hex;
}

function toKey(name) {
  const parts = name
    .replace(/\.colorset$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  if (parts.length === 0) return null;
  let key =
    parts[0].charAt(0).toLowerCase() +
    parts[0].slice(1) +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
  if (/^[0-9]/.test(key)) key = "_" + key;
  return key;
}

const light = new Map();
const dark = new Map();
let skipped = 0;

for (const dir of findColorSets(SOURCE)) {
  const name = path.basename(dir);
  const key = toKey(name);
  const file = path.join(dir, "Contents.json");

  if (!key || !fs.existsSync(file)) {
    console.warn(`⚠️  Skipped ${name}: no Contents.json`);
    skipped++;
    continue;
  }

  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn(`⚠️  Skipped ${name}: invalid Contents.json`);
    skipped++;
    continue;
  }

  const items = json.colors || [];
  const hasContrast = (i) =>
    (i.appearances || []).some((a) => a.appearance === "contrast");
  const isDark = (i) =>
    (i.appearances || []).some(
      (a) => a.appearance === "luminosity" && a.value === "dark",
    );

  const base = items.find((i) => !i.appearances && i.color);
  const darkItem = items.find((i) => isDark(i) && !hasContrast(i) && i.color);

  const lightHex = base ? toHex(base.color) : null;
  const darkHex = darkItem ? toHex(darkItem.color) : null;

  if (!lightHex && !darkHex) {
    console.warn(
      `⚠️  Skipped ${name}: no usable color values (system or named color?)`,
    );
    skipped++;
    continue;
  }

  if (light.has(key))
    console.warn(`⚠️  Collision: '${key}' is being overwritten!`);

  light.set(key, lightHex || darkHex);
  dark.set(key, darkHex || lightHex); // no dark variant -> reuse light
}

const keys = [...light.keys()].sort();
const block = (map) => keys.map((k) => `    ${k}: '${map.get(k)}',`).join("\n");

const content = `// Automatically generated file. Do not edit manually.
// Source: ${path.basename(SOURCE)}

export const Colors = {
  light: {
${block(light)}
  },
  dark: {
${block(dark)}
  },
} as const;

export type ColorName = keyof typeof Colors.light;
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, content);

console.log(`✅ Success! Wrote ${keys.length} colors to ${OUTPUT}`);
if (skipped > 0)
  console.log(`⚠️  ${skipped} color set(s) skipped. See warnings above.`);
