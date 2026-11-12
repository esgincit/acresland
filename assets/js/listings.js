/* ============================================================
   ACRES PROPERTIES — listings page (search / filter / sort)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const { properties } = loadData();
  const params = urlParams();

  const $ = id => document.getElementById(id);
  const controls = {
    status: $("fStatus"), type: $("fType"), location: $("fLocation"),
    min: $("fMin"), max: $("fMax"), beds: $("fBeds"), sort: $("sortSelect"),
  };

  /* Pre-fill from URL (deep links from homepage / category tiles) */
  for (const k of Object.keys(controls)) {
    const v = params.get(k);
    if (v !== null && v !== "" && controls[k]) controls[k].value = v;
  }

  /* Type quick-filter chips */
  const chipsWrap = $("typeChips");
  const chipDefs = [["", "All Types"], ["Agriculture", "🚜 Agriculture"], ["Commercial", "🏢 Commercial"], ["House", "🏠 House"], ["Apartment", "🏙 Apartment"]];
  chipsWrap.innerHTML = chipDefs.map(([v, label]) =>
    `<button type="button" class="chip ${controls.type.value === v ? "active" : ""}" data-type="${v}">${label}</button>`).join("");
  chipsWrap.addEventListener("click", e => {
    const chip = e.target.closest("[data-type]");
    if (!chip) return;
    controls.type.value = chip.dataset.type;
    chipsWrap.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    render();
  });

  /* Live filtering on every control change */
  Object.values(controls).forEach(el => el.addEventListener("input", render));
  $("filterForm").addEventListener("submit", e => { e.preventDefault(); render(); });

  function applyFilters() {
    const st = controls.status.value.trim().toLowerCase();
    const ty = controls.type.value.trim().toLowerCase();
    const loc = controls.location.value.trim().toLowerCase();
    const min = parseFloat(controls.min.value) || 0;
    const max = parseFloat(controls.max.value) || Infinity;
    const beds = parseInt(controls.beds.value) || 0;

    let out = properties.filter(p => {
      if (st && p.status.toLowerCase() !== st) return false;
      if (ty && p.type.toLowerCase() !== ty) return false;
      if (loc && !(`${p.locality} ${p.city} ${p.state}`.toLowerCase().includes(loc))) return false;
      if (p.price < min || p.price > max) return false;
      if (beds && (p.beds || 0) < beds) return false;
      return true;
    });

    switch (controls.sort.value) {
      case "lo": out.sort((a, b) => a.price - b.price); break;
      case "hi": out.sort((a, b) => b.price - a.price); break;
      case "az": out.sort((a, b) => a.title.localeCompare(b.title)); break;
      default:   out.sort((a, b) => (b.posted || "").localeCompare(a.posted || ""));
    }
    return out;
  }

  let grid = document.getElementById("resultsGrid");
  function render() {
    const list = applyFilters();
    $("resultCount").innerHTML = `<strong>${list.length}</strong> propert${list.length === 1 ? "y" : "ies"} found` +
      (controls.location.value ? ` in “${controls.location.value}”` : "");
    grid.innerHTML = list.map(propertyCard).join("");

    const empty = document.getElementById("emptyState");
    if (!list.length) {
      empty.innerHTML = `
        <div class="empty-state mt-2">
          <div class="big">🏘️</div>
          <h3>No properties match your filters</h3>
          <p class="text-muted">Try widening the budget, clearing the location, or tell us what you're looking for —
          <a href="contact.html" style="color:var(--green-700); font-weight:600">post a requirement</a> and we'll find it for you.</p>
          <button class="btn btn-ghost btn-sm mt-2" id="clearFilters">✕ Clear all filters</button>
        </div>`;
      document.getElementById("clearFilters").addEventListener("click", () => {
        Object.values(controls).forEach(el => { el.value = ""; });
        chipsWrap.querySelectorAll(".chip").forEach((c, i) => c.classList.toggle("active", i === 0));
        window.history.replaceState(null, "", "properties.html");
        render();
      });
    } else empty.innerHTML = "";

    /* keep the URL shareable */
    const qs = new URLSearchParams();
    for (const [k, el] of Object.entries(controls)) if (k !== "sort" && el.value) qs.set(k, el.value);
    const next = qs.toString() ? `properties.html?${qs}` : "properties.html";
    if (window.location.search !== (qs.toString() ? "?" + qs.toString() : "")) {
      window.history.replaceState(null, "", next);
    }
  }
  render();
});
