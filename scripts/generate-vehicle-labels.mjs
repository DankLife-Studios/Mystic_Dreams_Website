/**
 * Build vehicle display labels from Qbox shared/vehicles.lua
 *
 * Usage:
 *   node scripts/generate-vehicle-labels.mjs
 *   node scripts/generate-vehicle-labels.mjs "F:/path/to/vehicles.lua"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultLua = path.resolve(
  __dirname,
  "../../Mystic_Dreams/MysticDreams.base/resources/[qbx]/qbx_core/shared/vehicles.lua"
);
const outFile = path.resolve(__dirname, "../lib/vehicle-labels.json");

const luaPath = process.argv[2] || defaultLua;

if (!fs.existsSync(luaPath)) {
  console.error(`vehicles.lua not found: ${luaPath}`);
  console.error("Pass the path to your server's qbx_core/shared/vehicles.lua");
  process.exit(1);
}

const lua = fs.readFileSync(luaPath, "utf8");
const labels = {};

const blockRe = /^\s{4}([\w]+)\s*=\s*\{([\s\S]*?)^\s{4}\},/gm;
const inlineRe = /^\s{4}([\w]+)\s*=\s*\{([^}]+)\},?\s*$/gm;

function parseBlock(key, body) {
  const nameMatch = body.match(/name\s*=\s*['"]([^'"]*)['"]/);
  const brandMatch = body.match(/brand\s*=\s*['"]([^'"]*)['"]/);
  if (!nameMatch) return;

  const name = nameMatch[1];
  const brand = brandMatch ? brandMatch[1].trim() : "";
  labels[key.toLowerCase()] = brand ? `${brand} ${name}`.trim() : name;
}

let match;
while ((match = blockRe.exec(lua)) !== null) {
  parseBlock(match[1], match[2]);
}

while ((match = inlineRe.exec(lua)) !== null) {
  if (!labels[match[1].toLowerCase()]) {
    parseBlock(match[1], match[2]);
  }
}

fs.writeFileSync(outFile, JSON.stringify(labels, null, 0));
console.log(`Wrote ${Object.keys(labels).length} labels to ${outFile}`);
