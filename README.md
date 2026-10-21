# UtilityCheck – Philippine Electric Utilities

Static single-page site (no build step). Leaflet and map tiles load from CDNs, so an internet connection is required.

## Deploy to Netlify
**Drag & drop:** Netlify → Add new site → Deploy manually → drop this folder.
**Git:** push to GitHub, then Add new site → Import from Git. Build command: *(empty)*. Publish directory: `.`

## Before going live
In `index.html`, replace `FORM_REP` and `FORM_BILL` (search `REPLACE_`) with your real Google Form links.
Rates live in the `RATES` object in `index.html` as `RATES[utility][YYYY-MM]` (source: PRESYO-PH). To add a month, add a `"YYYY-MM":rate` entry per utility; the month picker updates automatically.
