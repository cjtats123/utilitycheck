# UtilityCheck – Philippine Electric Utilities

Static single-page site (no build step). Leaflet is loaded from cdnjs and map tiles from OpenStreetMap, so visitors need an internet connection for the map (the list works without it).

## Deploy to Netlify
**Drag & drop:** Netlify → Add new site → Deploy manually → drop this folder.
**Git:** push to GitHub, then Add new site → Import from Git. Build command: *(empty)*. Publish directory: `.`

`netlify.toml` already sets security headers (including a Content-Security-Policy), cache rules, and hides `scripts/`, `README.md` and `netlify.toml` from the public site (they return 404).

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app (markup, CSS, JS, and the data) |
| `favicon.svg`, `*.png`, `site.webmanifest` | Icons / "Add to Home Screen" |
| `404.html`, `robots.txt` | Not-found page, crawler rules |
| `scripts/` | Rate importer (dev tooling, not served) |

## Data
Rates live in the `RATES` object in `index.html` as `RATES[utility][YYYY-MM]` (source: PRESYO-PH). The month picker updates automatically from whatever months are in there.

> Keep the `const R=\`…\`.split(…)` list and the `const RATES={ … };` block in that exact form: the importer finds them by text.

## Import rates from PRESYO-PH
The API is `https://presyo.icsc.ngo/api/national?month=May&year=2026`; only `month` and `year` change. The importer walks every month the API has data for and merges the residential rate per utility into `RATES`:

```
node scripts/fetch-rates.mjs              # all available months, fills gaps only (Node 18+, no dependencies)
node scripts/fetch-rates.mjs --refresh    # also overwrite existing numeric rates with API values
node scripts/fetch-rates.mjs --from 2024-01 --to 2026-05
node scripts/fetch-rates.mjs --dry        # report only, don't write
```
**If Node can't reach the site** (office network/firewall) but your browser can: open https://presyo.icsc.ngo in the browser, press F12, open the Console, paste the contents of `scripts/browser-export.js` and press Enter (Chrome may ask you to type `allow pasting` first). It downloads `rates.json`; put it in the repo folder and run `node scripts/fetch-rates.mjs --file rates.json`.

It is safe to re-run (idempotent) and run it again each month to pick up the new one. Object-style entries (`{r,s,u,b}`) are never modified. API names are matched to the site's names (`NEECO 2 - A1` -> `NEECO II Area 1`, `NUVELCO` -> `NUVELECO`, etc.); anything unmatched is listed at the end of the run. Fix spelling differences in the `ALIASES` map at the top of the script.
