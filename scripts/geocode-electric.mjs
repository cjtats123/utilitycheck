#!/usr/bin/env node
/**
 * Looks up exact head-office coordinates for the electric utilities via OpenStreetMap Nominatim and
 * saves them to scripts/electric-coords.json ({ "<CODE>": [lat, lon] }). Then run set-electric-pins.mjs.
 *
 *   node scripts/geocode-electric.mjs --email you@example.com            # all utilities (~1 request/second)
 *   node scripts/geocode-electric.mjs --email you@example.com --only "NEECO I,LANECO"
 *   node scripts/geocode-electric.mjs --email you@example.com --refresh  # redo ones already saved
 *
 * The query is the HQ town from electric-geo.mjs (HQ), else "<area>, Philippines". A result is accepted only
 * if it lands within 0.8° of the pin already on the map (so a same-name town elsewhere can't win);
 * rejected ones are listed so you can add the right HQ town and run again. Nominatim's policy requires --email.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HQ, BOUNDS } from "./electric-geo.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url)), HTML = path.join(DIR, "..", "index.html"), OUT = path.join(DIR, "electric-coords.json");
const args = process.argv.slice(2), opt = n => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };
const email = opt("email"); if (!email) { console.error("Please pass --email you@example.com (required by Nominatim policy)."); process.exit(1); }
const only = opt("only") ? new Set(opt("only").split(",").map(s => s.trim())) : null, refresh = args.includes("--refresh");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

const m = fs.readFileSync(HTML, "utf8").match(/const R=`([\s\S]*?)`\.split/);
const todo = m[1].split("\n").map(l => l.split("|")).map(a => ({ code: a[0], area: a[3].replace(/&amp;/g, "&"), lat: +a[4], lon: +a[5] }))
  .filter(u => (only ? only.has(u.code) : refresh || !out[u.code]));
console.log(`${todo.length} utilities to look up`);

let hit = 0; const miss = [];
for (const [i, u] of todo.entries()) {
  const q = (HQ[u.code] || u.area) + ", Philippines";
  try {
    const res = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=" + encodeURIComponent(q),
      { headers: { "User-Agent": `utilitycheck-geocoder/1.0 (${email})` } });
    const j = await res.json(), p = j[0];
    const lat = p && +p.lat, lon = p && +p.lon;
    if (p && lat >= BOUNDS.lat[0] && lat <= BOUNDS.lat[1] && lon >= BOUNDS.lon[0] && lon <= BOUNDS.lon[1]
        && Math.hypot(lat - u.lat, lon - u.lon) < 0.8) { out[u.code] = [+lat.toFixed(4), +lon.toFixed(4)]; hit++; }
    else miss.push(`${u.code}  (searched: ${q})`);
  } catch (e) { miss.push(`${u.code}  (failed: ${e.message})`); }
  if ((i + 1) % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(out)); console.log(`  ${i + 1}/${todo.length}  (${hit} found)`); }
  await sleep(1100);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Done: ${hit}/${todo.length} found.`);
if (miss.length) console.log("Not accepted — add an HQ town for these in electric-geo.mjs and re-run:\n  " + miss.join("\n  "));
console.log("Now run: node scripts/set-electric-pins.mjs");
