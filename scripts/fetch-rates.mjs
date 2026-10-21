#!/usr/bin/env node
/**
 * Pulls monthly residential rates from the PRESYO-PH API and merges them into
 * the RATES block of index.html.
 *
 *   https://presyo.icsc.ngo/api/national?month=May&year=2026
 *
 * Only `month` and `year` change, so we walk every month the API has data for.
 *
 * Usage (Node 18+, no dependencies):
 *   node scripts/fetch-rates.mjs                  # all available months, fill gaps only
 *   node scripts/fetch-rates.mjs --refresh        # also overwrite existing numeric rates
 *   node scripts/fetch-rates.mjs --from 2024-01 --to 2026-05
 *   node scripts/fetch-rates.mjs --dry            # fetch and report, don't write
 *   node scripts/fetch-rates.mjs --file rates.json  # offline: read a JSON saved from the browser (see README)
 *
 * Values stored in RATES that are objects ({r, s, u, b}) are never touched.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HTML = path.join(ROOT, "index.html");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ---- CLI -------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = n => args.includes("--" + n);
const opt = n => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };
const BASE = opt("base") || "https://presyo.icsc.ngo/api/national";
const REFRESH = flag("refresh"), DRY = flag("dry");
const ym = s => { const m = /^(\d{4})-(\d{2})$/.exec(s || ""); if (!m) return null; return { y: +m[1], m: +m[2] }; };
const idx = ({ y, m }) => y * 12 + m - 1;
const fromIdx = ({ i }) => ({ y: Math.floor(i / 12), m: (i % 12) + 1 });
const key = ({ y, m }) => `${y}-${String(m).padStart(2, "0")}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- name matching (API name -> index.html name) ----------------------------
const ROMAN = { I: "1", II: "2", III: "3", IV: "4", V: "5" };
const ALIASES = { NUVELCO: "NUVELECO", SEZ: "SUBIC ENERZONE" }; // API spelling differences, normalized form
function norm(name) {
  let s = String(name).toUpperCase().replace(/\s*-\s*/g, " ").replace(/\bAREA\s+/g, "A").replace(/\s+/g, " ").trim();
  s = s.split(" ").map(t => ROMAN[t] || t).join(" ");
  return ALIASES[s] || s;
}

// ---- read index.html ---------------------------------------------------------
const html = fs.readFileSync(HTML, "utf8");
const listMatch = /const R=`([\s\S]*?)`\.split/.exec(html);
if (!listMatch) throw new Error("Could not find the utility list (const R=`...`) in index.html");
const siteNames = listMatch[1].split("\n").map(l => l.split("|")[0].trim()).filter(Boolean);
const lookup = new Map(siteNames.map(n => [norm(n), n]));

const START = "const RATES={\n", END = "\n};";
const a = html.indexOf(START);
const b = html.indexOf(END, a);
if (a < 0 || b < 0) throw new Error("Could not find the `const RATES={ ... };` block in index.html");
const rates = new Function("return {" + html.slice(a + START.length, b) + "}")();
for (const n of siteNames) if (!(n in rates)) rates[n] = null;

// ---- fetch -------------------------------------------------------------------
async function get(month, year) {
  const url = `${BASE}?month=${MONTHS[month - 1]}&year=${year}`;
  for (let t = 1; t <= 4; t++) {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (r.status === 400 || r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) {
      if (t === 4) { console.warn(`  ! ${url} failed: ${e.message}`); return null; }
      await sleep(800 * t);
    }
  }
}

// Returns Map(apiName -> rate) for the requested month, or null if the API has no data for it.
function extract(data, month, year) {
  if (!data || data.empty) return null;
  const label = `${MONTHS[month - 1]} ${year}`;
  if (data.selected_month_year && data.selected_month_year !== label) return null; // API fell back to another month
  const out = new Map();
  const layer = data.chart_specs?.map?.layers?.[0]?.data || [];
  for (const d of layer) {
    if (d.selected_month_year && d.selected_month_year !== label) continue;
    const v = +d.rate_value;
    if (d.du_name && v > 0) out.set(d.du_name, v);
  }
  // fall back to the table (2-decimal precision) for anything the map layer lacked
  for (const row of data.tables?.all || []) {
    const n = row["Distribution Utility"], v = parseFloat(row["Residential Electricity Rate (PHP/kWh)"]);
    if (n && v > 0 && !out.has(n)) out.set(n, v);
  }
  return out.size ? out : null;
}

// ---- main ----------------------------------------------------------------
const unmatched = new Map();
let added = 0, changed = 0, kept = 0;
const monthsWithData = [];

const FILE = opt("file");
let fileData = null;
if (FILE) fileData = JSON.parse(fs.readFileSync(FILE, "utf8")); // { "YYYY-MM": { "API NAME": rate } }

let start, end;
if (FILE) {
  const ks = Object.keys(fileData).filter(k => ym(k)).sort();
  start = ym(opt("from")) || ym(ks[0]); end = ym(opt("to")) || ym(ks[ks.length - 1]);
} else {
  // discover the range from the API itself (latest period + available years), unless overridden
  let probe = null;
  const now = new Date();
  for (let i = 0; i < 24 && !probe?.latest_available_period; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    probe = await get(d.getMonth() + 1, d.getFullYear());
  }
  end = ym(opt("to")); start = ym(opt("from"));
  if (!end) {
    const lp = /^(\w+)\s+(\d{4})$/.exec(probe?.latest_available_period || "");
    end = lp ? { y: +lp[2], m: MONTHS.indexOf(lp[1]) + 1 } : { y: now.getFullYear(), m: now.getMonth() + 1 };
  }
  if (!start) {
    const ys = probe?.filters?.years || [];
    start = { y: ys.length ? Math.min(...ys) : end.y, m: 1 };
  }
}
console.log(`Range: ${key(start)} -> ${key(end)}  (${FILE ? "file " + FILE : BASE})`);

for (let i = idx(start); i <= idx(end); i++) {
  const { y, m } = fromIdx({ i });
  const k = key({ y, m });
  let got;
  if (FILE) { const o = fileData[k]; got = o && Object.keys(o).length ? new Map(Object.entries(o).filter(([, v]) => +v > 0).map(([n, v]) => [n, +v])) : null; }
  else { got = extract(await get(m, y), m, y); await sleep(150); }
  if (!got || !got.size) { console.log(`  ${k}  no data`); continue; }
  let n = 0;
  for (const [apiName, rate] of got) {
    const site = lookup.get(norm(apiName));
    if (!site) { unmatched.set(apiName, (unmatched.get(apiName) || 0) + 1); continue; }
    const cur = rates[site]?.[k];
    if (cur !== undefined && typeof cur === "object" && cur !== null) { kept++; continue; }
    if (cur === undefined) { (rates[site] ||= {})[k] = rate; added++; n++; }
    else if (REFRESH && cur !== rate) { rates[site][k] = rate; changed++; n++; }
    else kept++;
  }
  monthsWithData.push(k);
  console.log(`  ${k}  ${got.size} utilities, ${n} written`);
}

// ---- write ---------------------------------------------------------------
const fmt = v => (v && typeof v === "object") ? JSON.stringify(v) : String(v);
const lines = siteNames.map(n => {
  const h = rates[n];
  if (!h || !Object.keys(h).length) return `${JSON.stringify(n)}:null`;
  const body = Object.keys(h).sort().map(m => `${JSON.stringify(m)}:${fmt(h[m])}`).join(",");
  return `${JSON.stringify(n)}:{${body}}`;
});
const out = html.slice(0, a + START.length) + lines.join(",\n") + html.slice(b);

console.log(`\nMonths with data: ${monthsWithData.length}  | added ${added}, overwritten ${changed}, unchanged ${kept}`);
if (unmatched.size) {
  console.log("\nAPI utilities with no match in index.html (add them to the list or ALIASES if you want them):");
  for (const [n, c] of [...unmatched].sort()) console.log(`  - ${n}  (${c} months)`);
}
const never = siteNames.filter(n => !rates[n] || !Object.keys(rates[n]).length);
if (never.length) console.log(`\nSite utilities with no API data in any month: ${never.join(", ")}`);

if (DRY) console.log("\n--dry: index.html not modified");
else { fs.writeFileSync(HTML, out); console.log(`\nUpdated ${path.relative(process.cwd(), HTML) || "index.html"}`); }
