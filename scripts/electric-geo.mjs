// Shared geography for the ELECTRIC map pins (the electric counterpart of water-geo.mjs).
//
// The electric list lives in index.html as  const R=`CODE|P/C|L/V/M|area|lat|lon ...`.split("\n")
// Pins are placed at the utility's head office (HQ) town, so a pin answers "where do I go / call?".
// Priority used by set-electric-pins.mjs for every utility:
//   1. electric-coords.json  (made by geocode-electric.mjs from the HQ town below)   -> exact pin
//   2. FIX below             (hand-verified head-office coordinates)                 -> exact pin
//   3. whatever is already in index.html
// After that, pins that sit on top of each other are fanned out a little (see spreadOverlaps) so every
// one of them stays clickable.

// Hand-verified corrections: code -> [lat, lon, "head office"]. Only add a line here once you have
// checked the utility's own website / NEA listing. Keep codes spelled exactly as in index.html.
export const FIX = {
  "BATELEC I":  [14.0722, 120.6333, "Nasugbu, Batangas"],
  "BATELEC II": [13.9411, 121.1631, "Antipolo del Norte, Lipa City, Batangas (batelec2.com.ph)"],
  "OMECO":      [12.3526, 121.0675, "San Jose, Occidental Mindoro"],
  "ORMECO":     [13.4117, 121.1803, "Calapan City, Oriental Mindoro"],
};

// Head-office town to look up with geocode-electric.mjs (optional; falls back to "<area>, Philippines").
// A town name geocodes far more precisely than a province name, so fill this in as you confirm each office.
export const HQ = {
  "BATELEC I": "Nasugbu, Batangas",
  "BATELEC II": "Lipa City, Batangas",
  "OMECO": "San Jose, Occidental Mindoro",
  "ORMECO": "Calapan, Oriental Mindoro",
};

// Island utilities that legitimately sit far from their province's mainland center (skipped by the distance check).
export const ISLAND_OK = new Set(["BISELCO", "CASELCO", "LUBELCO", "SIASELCO", "BATANELCO", "TAWELCO", "SULECO"]);

// Philippines bounding box used for sanity checks (lat min/max, lon min/max).
export const BOUNDS = { lat: [4.5, 21.5], lon: [116, 127] };

// Pins closer than this (degrees, ~1.7 km) are treated as stacked and fanned out on a small ring.
export const OVERLAP_DEG = 0.016;
export const SPREAD_RADIUS = 0.014;

export function spreadOverlaps(rows) {
  // rows: [{code, lat, lon}] -> returns Map(code -> [lat, lon]) for pins that had to move
  const n = rows.length, parent = rows.map((_, i) => i);
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
    if (Math.hypot(rows[i].lat - rows[j].lat, rows[i].lon - rows[j].lon) <= OVERLAP_DEG) parent[find(j)] = find(i);
  const groups = new Map();
  rows.forEach((r, i) => { const g = find(i); (groups.get(g) || groups.set(g, []).get(g)).push(r); });
  const moved = new Map();
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((a, b) => a.code.localeCompare(b.code));
    const cLat = g.reduce((s, r) => s + r.lat, 0) / g.length, cLon = g.reduce((s, r) => s + r.lon, 0) / g.length;
    g.forEach((r, k) => {
      const a = Math.PI / 2 + (2 * Math.PI * k) / g.length;
      moved.set(r.code, [+(cLat + SPREAD_RADIUS * Math.sin(a)).toFixed(4), +(cLon + SPREAD_RADIUS * Math.cos(a)).toFixed(4)]);
    });
  }
  return moved;
}
