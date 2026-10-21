# UtilityCheck – Philippine Electric Utilities

Static single-page site (no build step). Leaflet and map tiles load from CDNs, so an internet connection is required.

## Deploy to Netlify
**Drag & drop:** Netlify → Add new site → Deploy manually → drop this folder.
**Git:** push to GitHub, then Add new site → Import from Git. Build command: *(empty)*. Publish directory: `.`

## Before going live
In `index.html`, replace `FORM_REP` and `FORM_BILL` (search `REPLACE_`) with your real Google Form links.
Utility rates are edited in the rates object in `index.html`.
