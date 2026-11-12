/* ============================================================
   ACRES PROPERTIES — shared app logic (all pages)
   ============================================================ */

const STORAGE_KEY = "acres_data_v1";
const FAV_KEY = "acres_favs_v1";

/* ---------- Data layer (localStorage overrides seed) ---------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return {
        site: { ...SITE_DEFAULTS, ...saved.site, contact: { ...SITE_DEFAULTS.contact, ...(saved.site?.contact || {}) } },
        properties: Array.isArray(saved.properties) ? saved.properties : PROPERTIES_SEED,
      };
    }
  } catch (e) { /* corrupted storage — fall back to seed */ }
  return { site: SITE_DEFAULTS, properties: PROPERTIES_SEED };
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FAV_KEY);
}

/* ---------- Formatting ---------- */
function formatPrice(lakhs) {
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return "₹" + (Number.isInteger(cr) ? cr : cr.toFixed(2)) + " Cr";
  }
  const l = Math.round(lakhs * 100) / 100;
  return "₹" + (Number.isInteger(l) ? l : l.toFixed(2)) + " L";
}
function priceSuffix(status) {
  return status === "For Rent" ? "/mo" : "";
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Favorites ---------- */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const i = favs.indexOf(id);
  if (i >= 0) favs.splice(i, 1); else favs.push(id);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return i < 0; // true if now favourited
}

/* ---------- Toast ---------- */
let _toastTimer;
function toast(msg, type) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show " + (type || "");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------- SVG icons (inline, no icon-font dependency) ---------- */
const ICONS = {
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5H4"/><path d="M10 5 8 7"/><path d="M2 12h20"/></svg>',
  area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12"/><polyline points="6 12 2 12"/><polyline points="12 6 12 2"/><polyline points="12 22 12 18"/><circle cx="12" cy="12" r="9"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.23-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.87 9.9c-.01 5.44-4.44 9.87-9.89 9.87Zm8.42-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.47-8.4Z"/></svg>',
};

/* ---------- Header / footer ---------- */
function renderChrome() {
  const { site } = loadData();
  const c = site.contact;
  const page = document.body.dataset.page || "";
  const links = [
    ["index.html", "Home"],
    ["properties.html", "Listings"],
    ["about.html", "About"],
    ["contact.html", "Contact"],
  ];
  const nav = links.map(([href, label]) =>
    `<a href="${href}" class="${page === href.replace(".html", "") ? "active" : ""}">${label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <div class="topbar">
      <div class="container">
        <a href="tel:${c.phone.replace(/[^+\d]/g, "")}">${ICONS.phone}<span>${c.phone}</span></a>
        <span style="margin-left:auto">${ICONS.clock}<span>${c.hours}</span></span>
      </div>
    </div>
    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="index.html"><img src="${site.brand.logo}" alt="${site.brand.name}"></a>
        <nav class="main-nav" id="mainNav">${nav}</nav>
        <div class="nav-cta">
          <a class="btn btn-primary btn-sm" href="properties.html">Explore Properties</a>
          <button class="menu-toggle" id="menuToggle" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>`;

  document.getElementById("site-footer").innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <img class="f-logo" src="${site.brand.logo}" alt="${site.brand.name}">
            <p class="mt-2" style="font-size:.92rem">${site.brand.name} — ${site.brand.tagline}. Incorporated in 2020, pioneers in agriculture and residential properties across Telangana & Andhra Pradesh.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="properties.html">Property Listings</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="admin.html">Admin Panel</a></li>
            </ul>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>
              <li><a href="properties.html?type=Agriculture">Agriculture</a></li>
              <li><a href="properties.html?type=Commercial">Commercial</a></li>
              <li><a href="properties.html?type=House">House</a></li>
              <li><a href="properties.html?type=Apartment">Apartment</a></li>
            </ul>
          </div>
          <div>
            <h4>Get in Touch</h4>
            <ul class="f-contact">
              <li>${ICONS.pin}<span>${c.address}</span></li>
              <li>${ICONS.phone}<a href="tel:${c.phone.replace(/[^+\d]/g, "")}">${c.phone}</a></li>
              <li>${ICONS.mail}<a href="mailto:${c.email}">${c.email}</a></li>
            </ul>
            <form class="newsletter-form" action="https://formsubmit.co/${c.formsubmitEmail}" method="POST">
              <input type="hidden" name="_subject" value="Newsletter subscription — Acres Properties">
              <input type="hidden" name="_template" value="table">
              <input type="hidden" name="_captcha" value="false">
              <input type="text" name="_honey" style="display:none">
              <input type="email" name="email" placeholder="Your email" required>
              <button class="btn btn-primary btn-sm" type="submit">Join</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${site.brand.name}. All Rights Reserved.</span>
          <span>Made with Acres Properties</span>
        </div>
      </div>
    </footer>`;

  document.getElementById("menuToggle")?.addEventListener("click", () =>
    document.getElementById("mainNav").classList.toggle("open"));
}

/* ---------- Property card ---------- */
function propertyCard(p) {
  const favs = getFavs();
  const isFav = favs.includes(p.id);
  return `
  <article class="prop-card" data-id="${p.id}">
    <a class="prop-media" href="property.html?id=${encodeURIComponent(p.id)}">
      <img src="${p.image}" alt="${p.title}" loading="lazy">
      <div class="prop-tags">
        <span class="tag ${p.status === "For Rent" ? "tag-rent" : "tag-sale"}">${p.status}</span>
        ${p.featured ? '<span class="tag tag-feat">★ Featured</span>' : ""}
      </div>
      <div class="prop-price">${formatPrice(p.price)}${priceSuffix(p.status)}</div>
    </a>
    <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${p.id}" aria-label="Save to favourites">♥</button>
    <div class="prop-body">
      <span class="prop-type">${p.type}</span>
      <a class="prop-title" href="property.html?id=${encodeURIComponent(p.id)}">${p.title}</a>
      <span class="prop-loc">${ICONS.pin} ${p.locality}, ${p.city}</span>
      <div class="prop-meta">
        ${p.beds ? `<span>${ICONS.bed} ${p.beds} Beds</span>` : ""}
        ${p.baths ? `<span>${ICONS.bath} ${p.baths} Baths</span>` : ""}
        <span>${ICONS.area} ${p.area} ${p.areaUnit}</span>
      </div>
    </div>
  </article>`;
}

/* Wire favourite buttons (delegated once) */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  const id = btn.dataset.fav;
  const added = toggleFav(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => b.classList.toggle("active", added));
  toast(added ? "Saved to favourites ♥" : "Removed from favourites");
});

/* Back-to-top + shared wiring */
document.addEventListener("DOMContentLoaded", () => {
  const bt = document.createElement("button");
  bt.id = "backTop";
  bt.innerHTML = "↑";
  bt.setAttribute("aria-label", "Back to top");
  document.body.appendChild(bt);
  bt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => bt.classList.toggle("show", window.scrollY > 500));
});

/* URL param helper */
function urlParams() {
  return new URLSearchParams(window.location.search);
}
