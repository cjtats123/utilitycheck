// Paste into the browser console while on https://presyo.icsc.ngo (any page there).
// Fetches every month and downloads rates.json. Then run:  node scripts/fetch-rates.mjs --file rates.json
(async () => {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const out = {}, now = new Date();
  for (let y = 2020; y <= now.getFullYear(); y++) {
    for (let m = 0; m < 12; m++) {
      const label = `${MONTHS[m]} ${y}`;
      try {
        const r = await fetch(`/api/national?month=${MONTHS[m]}&year=${y}`);
        if (!r.ok) { console.log(label, "HTTP", r.status); continue; }
        const d = await r.json();
        if (d.empty || (d.selected_month_year && d.selected_month_year !== label)) { console.log(label, "no data"); continue; }
        const o = {};
        for (const x of d.chart_specs?.map?.layers?.[0]?.data || []) if (x.du_name && +x.rate_value > 0 && (!x.selected_month_year || x.selected_month_year === label)) o[x.du_name] = +x.rate_value;
        for (const row of d.tables?.all || []) { const n = row["Distribution Utility"], v = parseFloat(row["Residential Electricity Rate (PHP/kWh)"]); if (n && v > 0 && !(n in o)) o[n] = v; }
        if (Object.keys(o).length) { out[`${y}-${String(m + 1).padStart(2, "0")}`] = o; console.log(label, Object.keys(o).length, "utilities"); }
      } catch (e) { console.log(label, "failed", e.message); }
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
  a.download = "rates.json"; a.click();
  console.log("Done. Months:", Object.keys(out).length);
})();
