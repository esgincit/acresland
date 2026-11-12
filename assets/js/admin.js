/* ============================================================
   ACRES PROPERTIES — admin panel (Phase 1)
   Password gate → in-browser CRUD → export/import JSON.
   ============================================================ */

const $ = id => document.getElementById(id);
let DATA = loadData();

/* ---------- Auth ---------- */
(function initAuth() {
  const remembered = sessionStorage.getItem("acres_admin_ok") === "1";
  const gate = $("gate");
  if (remembered) return unlock();
  gate.style.display = "grid";
  $("gateForm").addEventListener("submit", e => {
    e.preventDefault();
    const pass = $("gatePass").value;
    const expected = DATA.site.admin.password;
    if (pass === expected) { sessionStorage.setItem("acres_admin_ok", "1"); unlock(); }
    else {
      toast("Incorrect password", "err");
      $("gatePass").value = "";
      $("gatePass").style.borderColor = "var(--red)";
      setTimeout(() => $("gatePass").style.borderColor = "", 1500);
    }
  });
})();

function unlock() {
  $("gate").style.display = "none";
  $("shell").classList.remove("hidden");
  initDashboard();
}

/* ---------- Dashboard ---------- */
let settingsDirty = false;

function initDashboard() {
  /* tabs */
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".admin-main > section").forEach(s => s.classList.add("hidden"));
      $("tab-" + btn.dataset.tab).classList.remove("hidden");
    });
  });

  renderTable();
  fillSettings();
  bindModal();
  bindDataTools();

  $("saveSettingsBtn").addEventListener("click", saveSettings);
}

/* ---------- Properties table ---------- */
function renderTable() {
  const rows = DATA.properties.map(p => `
    <tr>
      <td><img class="thumb" src="${p.image}" alt=""></td>
      <td>
        <a href="property.html?id=${encodeURIComponent(p.id)}" target="_blank" style="font-weight:600">${p.title}</a><br>
        <span class="text-muted" style="font-size:.8rem">${p.locality}, ${p.city} · ${p.area} ${p.areaUnit} · ${formatDate(p.posted)}</span>
      </td>
      <td>${p.type}</td>
      <td><span class="badge ${p.status === "For Rent" ? "badge-rent" : "badge-sale"}">${p.status}</span></td>
      <td><strong>${formatPrice(p.price)}</strong><br><span class="text-muted" style="font-size:.78rem">${priceSuffix(p.status)}</span></td>
      <td>
        <label class="switch"><input type="checkbox" data-feat="${p.id}" ${p.featured ? "checked" : ""}><span class="track"></span></label>
      </td>
      <td style="white-space:nowrap">
        <button class="icon-btn" data-edit="${p.id}" title="Edit">✏️</button>
        <button class="icon-btn" data-dup="${p.id}" title="Duplicate">📄</button>
        <button class="icon-btn" data-del="${p.id}" title="Delete">🗑️</button>
      </td>
    </tr>`).join("");
  $("propRows").innerHTML = rows ||
    `<tr><td colspan="7" style="text-align:center; padding:30px" class="text-muted">No properties — click “Add Property”.</td></tr>`;

  /* wire row actions */
  $("propRows").querySelectorAll("[data-feat]").forEach(el =>
    el.addEventListener("change", () => {
      const p = DATA.properties.find(x => x.id === el.dataset.feat);
      p.featured = el.checked;
      persist();
    }));
  $("propRows").querySelectorAll("[data-edit]").forEach(el =>
    el.addEventListener("click", () => openModal(DATA.properties.find(x => x.id === el.dataset.edit))));
  $("propRows").querySelectorAll("[data-del]").forEach(el =>
    el.addEventListener("click", () => {
      const p = DATA.properties.find(x => x.id === el.dataset.del);
      if (confirm(`Delete "${p.title}"?\n\n(This removes it from the admin's live dataset — use Export to publish the change.)`)) {
        DATA.properties = DATA.properties.filter(x => x.id !== p.id);
        persist(); renderTable(); toast("Property deleted");
      }
    }));
  $("propRows").querySelectorAll("[data-dup]").forEach(el =>
    el.addEventListener("click", () => {
      const src = DATA.properties.find(x => x.id === el.dataset.dup);
      const copy = structuredClone(src);
      copy.id = "acr-" + Date.now().toString(36).slice(-5);
      copy.title = src.title + " (Copy)";
      copy.featured = false;
      copy.posted = new Date().toISOString().slice(0, 10);
      DATA.properties.unshift(copy);
      persist(); renderTable(); toast("Duplicated — edit the copy now");
    }));
  $("addPropBtn").addEventListener("click", () => openModal(null));
}

function persist() {
  saveData(DATA);
  toast("Saved ✓ (this browser)", "ok");
}

/* ---------- Property modal ---------- */
function bindModal() {
  const back = $("propModal");
  const close = () => back.classList.remove("open");
  $("modalClose").addEventListener("click", close);
  $("modalCancel").addEventListener("click", close);
  back.addEventListener("click", e => { if (e.target === back) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  $("propForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const id = f.id.value;
    const rec = {
      id: id || "acr-" + Date.now().toString(36).slice(-5),
      title: f.title.value.trim(),
      type: f.type.value,
      status: f.status.value,
      price: parseFloat(f.price.value) || 0,
      city: f.city.value.trim(),
      locality: f.locality.value.trim(),
      state: f.state.value,
      beds: +f.beds.value || 0,
      baths: +f.baths.value || 0,
      area: parseFloat(f.area.value) || 0,
      areaUnit: f.areaUnit.value,
      description: f.description.value.trim(),
      features: f.features.value.split("\n").map(s => s.trim()).filter(Boolean),
      image: f.image.value.trim(),
      images: f.images.value.split("\n").map(s => s.trim()).filter(Boolean),
      featured: f.featured.checked,
      posted: f.posted.value || new Date().toISOString().slice(0, 10),
      agent: f.agent.value.trim() || AGENT.name,
    };
    if (!rec.image) { toast("Main image URL is required", "err"); return; }

    if (id) {
      const i = DATA.properties.findIndex(x => x.id === id);
      DATA.properties[i] = rec;
    } else {
      DATA.properties.unshift(rec);
    }
    persist(); renderTable(); close();
  });
}

function openModal(p) {
  const f = $("propForm");
  $("modalTitle").textContent = p ? "Edit Property" : "Add Property";
  f.reset();
  f.posted.value = p?.posted || new Date().toISOString().slice(0, 10);
  if (p) {
    f.id.value = p.id;
    f.title.value = p.title; f.type.value = p.type; f.status.value = p.status;
    f.price.value = p.price; f.city.value = p.city; f.locality.value = p.locality;
    f.state.value = p.state; f.beds.value = p.beds; f.baths.value = p.baths;
    f.area.value = p.area; f.areaUnit.value = p.areaUnit;
    f.image.value = p.image; f.images.value = (p.images || []).join("\n");
    f.description.value = p.description || "";
    f.features.value = (p.features || []).join("\n");
    f.agent.value = p.agent || AGENT.name;
    f.featured.checked = !!p.featured;
  }
  $("propModal").classList.add("open");
  f.title.focus();
}

/* ---------- Settings ---------- */
function fillSettings() {
  const c = DATA.site.contact;
  $("stPhone").value = c.phone;
  $("stWa").value = c.whatsapp;
  $("stEmail").value = c.email;
  $("stFs").value = c.formsubmitEmail;
  $("stHours").value = c.hours;
  $("stAddr").value = c.address;
  $("stPass").value = DATA.site.admin.password;
  $("stEyebrow").value = DATA.site.hero.eyebrow;
  $("stTitle").value = DATA.site.hero.title;
  $("stSub").value = DATA.site.hero.subtitle;
  $("stTagline").value = DATA.site.brand.tagline;
  $("stStatsWrap").innerHTML = DATA.site.stats.map((s, i) => `
    <div class="field"><label>${s.label} (value)</label><input data-stat="${i}" type="number" value="${s.value}"></div>
  `).join("");
}

function saveSettings() {
  const c = DATA.site.contact;
  c.phone = $("stPhone").value.trim();
  c.whatsapp = $("stWa").value.replace(/[^\d]/g, "");
  c.email = $("stEmail").value.trim();
  c.formsubmitEmail = $("stFs").value.trim();
  c.hours = $("stHours").value.trim();
  c.address = $("stAddr").value.trim();
  DATA.site.admin.password = $("stPass").value.trim() || DATA.site.admin.password;
  DATA.site.hero.eyebrow = $("stEyebrow").value.trim();
  DATA.site.hero.title = $("stTitle").value.trim();
  DATA.site.hero.subtitle = $("stSub").value.trim();
  DATA.site.brand.tagline = $("stTagline").value.trim();
  document.querySelectorAll("[data-stat]").forEach(el => {
    DATA.site.stats[+el.dataset.stat].value = +el.value || 0;
  });
  persist();
  toast("Settings saved — refresh the website tab to see them", "ok");
}

/* ---------- Export / Import / Reset ---------- */
function bindDataTools() {
  $("exportJsonBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "acres-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Downloaded acres-data.json", "ok");
  });

  $("copyJsonBtn").addEventListener("click", async () => {
    const json = JSON.stringify(DATA, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      toast("JSON copied — paste it into assets/js/data.js", "ok");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = json; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
      toast("JSON copied", "ok");
    }
  });

  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.properties) throw new Error("Missing 'properties'");
        DATA = {
          site: { ...SITE_DEFAULTS, ...parsed.site, contact: { ...SITE_DEFAULTS.contact, ...(parsed.site?.contact || {}) } },
          properties: parsed.properties,
        };
        saveData(DATA);
        renderTable(); fillSettings();
        toast("Imported successfully ✓", "ok");
      } catch (err) {
        toast("Invalid file: " + err.message, "err");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset everything (properties, settings, favourites) back to the shipped seed data?")) return;
    resetData();
    DATA = loadData();
    renderTable(); fillSettings();
    toast("Reset to seed data", "ok");
  });
}
