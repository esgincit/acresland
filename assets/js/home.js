/* ============================================================
   ACRES PROPERTIES — homepage logic
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const { site, properties } = loadData();

  /* Hero copy from admin-editable settings */
  document.getElementById("heroEyebrow").textContent = site.hero.eyebrow;
  document.getElementById("heroTitle").textContent = site.hero.title;
  document.getElementById("heroSub").textContent = site.hero.subtitle;
  document.title = `${site.brand.name} — Buy, Sell & Rent Properties in Telangana & Andhra Pradesh`;

  /* Category tiles with live counts */
  const cats = [
    ["Agriculture", "Farms & open lands"],
    ["Commercial", "Offices, retail & warehousing"],
    ["House", "Independent homes & villas"],
    ["Apartment", "Flats in gated communities"],
  ];
  document.getElementById("catGrid").innerHTML = cats.map(([type, sub]) => {
    const n = properties.filter(p => p.type === type).length;
    const img = {
      Agriculture: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=60",
      Commercial:  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=60",
      House:       "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=60",
      Apartment:   "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=60",
    }[type];
    return `<a class="cat-tile" href="properties.html?type=${encodeURIComponent(type)}">
      <img src="${img}" alt="${type} properties" loading="lazy">
      <div class="cat-label"><strong>${type}</strong><small>${n} listing${n !== 1 ? "s" : ""} · ${sub}</small></div>
    </a>`;
  }).join("");

  /* Featured */
  const featured = properties.filter(p => p.featured);
  const featGrid = document.getElementById("featuredGrid");
  if (featured.length) {
    featGrid.innerHTML = featured.map(propertyCard).join("");
  } else {
    featGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="big">⭐</div><p>No featured properties yet — mark some in the <a href="admin.html">admin panel</a>.</p></div>`;
  }

  /* Recent (newest 4) */
  const recent = [...properties].sort((a, b) => (b.posted || "").localeCompare(a.posted || "")).slice(0, 4);
  document.getElementById("recentGrid").innerHTML = recent.map(propertyCard).join("");

  /* Stats */
  document.getElementById("statsGrid").innerHTML = site.stats.map(s => `
    <div>
      <div class="stat-num" data-count="${s.value}">0</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join("");

  /* Animate counters */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      const target = +el.dataset.count;
      const t0 = performance.now(), dur = 1400;
      (function tick(t) {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString("en-IN") + "+";
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: .4 });
  document.querySelectorAll("[data-count]").forEach(el => io.observe(el));

  /* Testimonials */
  const tst = [
    ["Ramesh Chandra", "Bought 3 acres in Karimnagar", "Acres made our farmland purchase completely stress-free — clear title, honest price and they handled registration personally."],
    ["Sunitha Reddy", "Homeowner, Hyderabad", "I found my 3BHK in Kondapur within a week. The WhatsApp updates and site-visit scheduling were so convenient."],
    ["Vikram Rao", "Leased office in Madhapur", "As a startup, we needed furnished space fast. Their team showed us four offices in one day and negotiated a great rent."],
  ];
  document.getElementById("tstGrid").innerHTML = tst.map(([name, role, text]) => `
    <div class="tst-card">
      <div class="tst-stars">★★★★★</div>
      <p>“${text}”</p>
      <div class="tst-who">
        <div class="tst-avatar">${name[0]}</div>
        <div><strong>${name}</strong><small>${role}</small></div>
      </div>
    </div>`).join("");
});
