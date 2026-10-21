// Run in the browser console on https://presyo.icsc.ngo/references (after the page has fully loaded).
// It (1) scrapes every link on the page with its surrounding row/card text, and
// (2) re-fetches any same-origin API/JSON calls the page made, then downloads everything as presyo-references.json.
(async () => {
  const out = { page: location.href, links: [], api: {} };
  const seen = new Set();
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.href;
    if (!/^https?:/.test(href) || href.startsWith(location.origin + "/#")) return;
    const box = a.closest("tr, li, article, [class*=card], [class*=row], section") || a.parentElement;
    const key = href + "|" + (box ? box.innerText.slice(0, 80) : "");
    if (seen.has(key)) return; seen.add(key);
    out.links.push({ href, label: a.innerText.trim(), context: (box ? box.innerText : "").replace(/\s+/g, " ").trim().slice(0, 300) });
  });
  const calls = performance.getEntriesByType("resource")
    .map(r => r.name).filter(u => u.startsWith(location.origin) && /api|json|reference|utilit|dist/i.test(u) && !/\.(js|css|png|svg|woff2?)(\?|$)/i.test(u));
  for (const u of [...new Set(calls)]) {
    try { const r = await fetch(u); const t = await r.text(); try { out.api[u] = JSON.parse(t); } catch { out.api[u] = t.slice(0, 20000); } } catch (e) { out.api[u] = "error: " + e; }
  }
  const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "presyo-references.json"; a.click();
  console.log("links:", out.links.length, "api calls:", Object.keys(out.api).length);
})();
