#!/usr/bin/env node
/**
 * Sets correct map-pin coordinates for the ELECTRIC utilities in index.html.
 *
 *   node scripts/set-electric-pins.mjs            # fix and write index.html
 *   node scripts/set-electric-pins.mjs --dry      # report only, change nothing
 *
 * For each utility:  scripts/electric-coords.json (geocoded)  >  FIX in electric-geo.mjs  >  existing value.
 * Then: stacked pins are fanned out so each is clickable, and every pin is sanity-checked
 * (inside the Philippines, and not far from the province named in its area text).
 * Safe to re-run (idempotent). Needs Node 18+, no dependencies, no network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROV, prettyProv } from "./water-geo.mjs";
import { FIX, BOUNDS, ISLAND_OK, spreadOverlaps } from "./electric-geo.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url)), HTML = path.join(DIR, "..", "index.html");
const DRY = process.argv.includes("--dry");
const src = fs.readFileSync(HTML, "utf8");
const m = src.match(/(const R=`)([\s\S]*?)(`\.split\("\\n"\))/);
if (!m) { console.error("Could not find the  const R=`…`.split(\"\\n\")  block in index.html"); process.exit(1); }

const coordsFile = path.join(DIR, "electric-coords.json");
const geo = fs.existsSync(coordsFile) ? JSON.parse(fs.readFileSync(coordsFile, "utf8")) : {};
const rows = m[2].split("\n").map(l => { const a = l.split("|"); return { raw: a, code: a[0], area: a[3], lat: +a[4], lon: +a[5], why: "" }; });

// 1) exact coordinates (geocoded, then hand-verified)
for (const r of rows) {
  const g = geo[r.code], f = FIX[r.code];
  if (g) { r.lat = g[0]; r.lon = g[1]; r.why = "geocoded HQ"; }
  else if (f) { r.lat = f[0]; r.lon = f[1]; r.why = "verified HQ: " + f[2]; }
}
// 2) un-stack overlapping pins
const moved = spreadOverlaps(rows);
for (const r of rows) if (moved.has(r.code)) { [r.lat, r.lon] = moved.get(r.code); r.why = (r.why ? r.why + " + " : "") + "fanned out (was stacked)"; }

// 3) sanity checks
const warn = [];
const provKeys = Object.keys(PROV);
for (const r of rows) {
  if (!(r.lat >= BOUNDS.lat[0] && r.lat <= BOUNDS.lat[1] && r.lon >= BOUNDS.lon[0] && r.lon <= BOUNDS.lon[1]) || Number.isNaN(r.lat + r.lon))
    warn.push(`${r.code}: ${r.lat},${r.lon} is outside the Philippines`);
  const a = r.area.toLowerCase().replace(/&amp;/g, "&");
  const hits = provKeys.filter(k => a.includes(prettyProv(k).toLowerCase()) || a.includes(k.toLowerCase()));
  if (hits.length && !ISLAND_OK.has(r.code)) {
    const d = Math.min(...hits.map(k => Math.hypot(r.lat - PROV[k][0], r.lon - PROV[k][1])));
    if (d > 0.9) warn.push(`${r.code}: ${d.toFixed(2)}° from ${hits.join("/")} — check this pin`);
  }
}

// 4) write back, touching only the rows that changed
let changed = 0;
const out = rows.map(r => {
  const [la, lo] = [r.raw[4], r.raw[5]];
  if (+la === r.lat && +lo === r.lon) return r.raw.join("|");
  changed++;
  console.log(`${r.code.padEnd(18)} ${la},${lo}  ->  ${r.lat.toFixed(4)},${r.lon.toFixed(4)}   (${r.why})`);
  return [...r.raw.slice(0, 4), r.lat.toFixed(4), r.lon.toFixed(4)].join("|");
}).join("\n");

console.log(`\n${changed} pin(s) ${DRY ? "would change" : "changed"} out of ${rows.length}.`);
if (warn.length) console.log("\nWarnings (review these):\n  " + warn.join("\n  "));
if (!DRY && changed) { fs.writeFileSync(HTML, src.replace(m[0], m[1] + out + m[3])); console.log("\nindex.html updated."); }
