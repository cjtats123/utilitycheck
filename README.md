# UtilityCheck – Philippine Electric Utilities

Static single-page site (no build step). Leaflet and map tiles load from CDNs, so an internet connection is required.

## Deploy to Netlify
**Drag & drop:** Netlify → Add new site → Deploy manually → drop this folder.
**Git:** push to GitHub, then Add new site → Import from Git. Build command: *(empty)*. Publish directory: `.`

## Before going live
In `index.html`, replace `FORM_REP` and `FORM_BILL` (search `REPLACE_`) with your real Google Form links.
Rates live in the `RATES` object in `index.html` as `RATES[utility][YYYY-MM]` (source: PRESYO-PH). The month picker updates automatically from whatever months are in there.

## Import rates from PRESYO-PH
The API is `https://presyo.icsc.ngo/api/national?month=May&year=2026`; only `month` and `year` change. The importer walks every month the API has data for and merges the residential rate per utility into `RATES`:

```
node scripts/fetch-rates.mjs              # all available months, fills gaps only (Node 18+, no dependencies)
node scripts/fetch-rates.mjs --refresh    # also overwrite existing numeric rates with API values
node scripts/fetch-rates.mjs --from 2024-01 --to 2026-05
node scripts/fetch-rates.mjs --dry        # report only, don't write
```
It is safe to re-run (idempotent) and run it again each month to pick up the new one. Object-style entries (`{r,s,u,b}`) are never modified. API names are matched to the site's names (`NEECO 2 - A1` -> `NEECO II Area 1`, `NUVELCO` -> `NUVELECO`, etc.); anything unmatched is listed at the end of the run. Fix spelling differences in the `ALIASES` map at the top of the script.
