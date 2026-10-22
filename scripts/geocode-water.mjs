#!/usr/bin/env node
/**
 * Finds exact coordinates for water districts via OpenStreetMap Nominatim and saves them to
 * scripts/water-coords.json  ({ "<ccc>": [lat, lon] }). Then run  node scripts/build-water.mjs.
 *
 *   node scripts/geocode-water.mjs --email you@example.com      # resumable; ~1 request/second (~8 min)
 *   node scripts/geocode-water.mjs --email you@example.com --limit 20
 *
 * Nominatim's usage policy requires an identifying contact, so --email is required.
 * A hit is only accepted if it lies within ~1.2 degrees of the province center (guards against same-name
 * towns elsewhere). Anything rejected or not found is simply left approximate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROV, CITY, prettyProv } from "./water-geo.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = n => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };
const email = opt("email"); if (!email) { console.error("Please pass --email you@example.com (required by Nominatim policy)."); process.exit(1); }
const limit = +opt("limit") || Infinity, OUT = path.join(DIR, "water-coords.json");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

const lines = fs.readFileSync(path.join(DIR, "data/water_districts_latest.csv"), "utf8").trim().split("\n").slice(1);
const todo = lines.map(l => l.split(",")).map(c => ({ ccc: c[0], name: c[1], prov: c[2] }))
  .filter(d => !out[d.ccc] && !CITY[d.name + "|" + d.prov]).slice(0, limit);
console.log(`${todo.length} districts to look up`);

let n = 0, hit = 0;
for (const d of todo) {
  const base = d.name.replace(/^City of /, "").replace(/ City$/, "").replace(/^Island Garden City of /, "");
  const q = `${base}, ${prettyProv(d.prov)}, Philippines`;
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=" + encodeURIComponent(q),
      { headers: { "User-Agent": `utilitycheck-geocoder/1.0 (${email})` } });
    const j = await res.json(), p = PROV[d.prov];
    if (j[0]) {
      const lat = +j[0].lat, lon = +j[0].lon;
      if (Math.abs(lat - p[0]) < 1.2 && Math.abs(lon - p[1]) < 1.2) { out[d.ccc] = [+lat.toFixed(4), +lon.toFixed(4)]; hit++; }
    }
  } catch (e) { console.error("  failed:", q, e.message); }
  if (++n % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(out)); console.log(`  ${n}/${todo.length}  (${hit} found)`); }
  await sleep(1100);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Done: ${hit}/${todo.length} found. Now run: node scripts/build-water.mjs`);
