/* ============================================================
   ACRES PROPERTIES — single property page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const { site, properties } = loadData();
  const c = site.contact;
  const id = urlParams().get("id");
  const p = properties.find(x => x.id === id) || properties[0];
  const root = document.getElementById("detailRoot");
  const waLink = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(`Hi Acres Properties, I'm interested in "${p.title}" (${p.id}). Please share details.`)}`;

  if (!p) {
    root.innerHTML = `<div class="empty-state"><div class="big">🔎</div><h3>Property not found</h3><p><a href="properties.html" style="color:var(--green-700);font-weight:600">← Back to listings</a></p></div>`;
    return;
  }

  document.title = `${p.title} — ${site.brand.name}`;
  const gallery = [p.image, ...(p.images || [])].filter((v, i, a) => a.indexOf(v) === i);
  const favs = getFavs();

  root.innerHTML = `
    <nav class="breadcrumb"><a href="index.html">Home</a> / <a href="properties.html">Listings</a> / ${p.title}</nav>

    <div class="detail-grid">
      <!-- ============ LEFT: gallery + info ============ -->
      <div style="display:flex; flex-direction:column; gap:24px">
        <div>
          <div class="gallery-main"><img id="galMain" src="${gallery[0]}" alt="${p.title}"></div>
          <div class="thumbs" id="galThumbs">
            ${gallery.map((src, i) => `<img src="${src}" class="${i === 0 ? "active" : ""}" data-gal="${src}" alt="Photo ${i + 1}">`).join("")}
          </div>
        </div>

        <div class="detail-panel">
          <div class="flex" style="justify-content:space-between; align-items:flex-start">
            <div>
              <span class="prop-type">${p.type}</span>
              <h1 style="font-size:clamp(1.3rem,2.6vw,1.75rem)">${p.title}</h1>
              <span class="prop-loc mt-1">${ICONS.pin} ${p.locality}, ${p.city}, ${p.state}</span>
            </div>
            <button class="fav-btn ${favs.includes(p.id) ? "active" : ""}" data-fav="${p.id}" style="position:static" aria-label="Favourite">♥</button>
          </div>

          <div class="spec-grid">
            <div class="spec">${ICONS.bed}<strong>${p.beds || "—"}</strong><small>Bedrooms</small></div>
            <div class="spec">${ICONS.bath}<strong>${p.baths || "—"}</strong><small>Bathrooms</small></div>
            <div class="spec">${ICONS.area}<strong>${p.area}</strong><small>${p.areaUnit}</small></div>
            <div class="spec">📅<strong>${formatDate(p.posted)}</strong><small>Listed on</small></div>
          </div>

          <h3 class="mt-4">Overview</h3>
          <p class="text-muted mt-1">${p.description}</p>

          <h3 class="mt-4">Amenities &amp; Highlights</h3>
          <ul class="features-list">${(p.features || []).map(f => `<li>${f}</li>`).join("")}</ul>
        </div>

        <!-- Enquiry form (formsubmit.co) -->
        <div class="detail-panel" id="enquire">
          <h3>Enquire About This Property</h3>
          <p class="text-muted" style="font-size:.9rem">Fill the form and our agent will call you back shortly (8am–9pm).</p>
          <form class="form-grid mt-2" action="https://formsubmit.co/${c.formsubmitEmail}" method="POST">
            <input type="hidden" name="_subject" value="Property Enquiry: ${p.title} (${p.id})">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="property" value="${p.title} — ${p.locality}, ${p.city} (₹${formatPrice(p.price)})">
            <input type="text" name="_honey" style="display:none">
            <div class="field"><label>Name *</label><input name="name" required placeholder="Your full name"></div>
            <div class="field"><label>Phone *</label><input name="phone" type="tel" required placeholder="+91 ..."></div>
            <div class="field full"><label>Email</label><input name="email" type="email" placeholder="you@example.com"></div>
            <div class="field full"><label>Message</label><textarea name="message" rows="4" placeholder="I'd like to schedule a site visit…"></textarea></div>
            <div class="full"><button class="btn btn-primary" type="submit">Send Enquiry →</button></div>
          </form>
        </div>
      </div>

      <!-- ============ RIGHT: sticky sidebar ============ -->
      <aside class="side-card">
        <div class="detail-panel agent-card">
          <div class="prop-price" style="position:static; display:inline-block; font-size:1.25rem; padding:10px 18px">
            ${formatPrice(p.price)}${priceSuffix(p.status)}
          </div>
          <p class="text-muted mt-1" style="font-size:.85rem">${p.status} · Ref ${p.id}</p>
          <hr style="border:none; border-top:1px dashed var(--line); margin:16px 0">
          <div class="agent-avatar">${(p.agent || AGENT.name).split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
          <strong>${p.agent || AGENT.name}</strong>
          <p class="text-muted" style="font-size:.85rem">${AGENT.role} · Acres Properties</p>
          <div class="mt-2" style="display:flex; flex-direction:column; gap:9px">
            <a class="btn btn-whatsapp btn-sm" href="${waLink}" target="_blank" rel="noopener">${ICONS.wa} WhatsApp Now</a>
            <a class="btn btn-primary btn-sm" href="tel:${c.phone.replace(/[^+\d]/g, "")}">${ICONS.phone} ${c.phone}</a>
            <a class="btn btn-ghost btn-sm" href="#enquire">✉️ Send Enquiry</a>
          </div>
        </div>

        <div class="detail-panel">
          <h4 style="margin-bottom:12px">Property Summary</h4>
          <table style="width:100%; font-size:.9rem; border-collapse:collapse">
            <tr><td class="text-muted" style="padding:7px 0">Status</td><td style="text-align:right"><span class="badge ${p.status === "For Rent" ? "badge-rent" : "badge-sale"}">${p.status}</span></td></tr>
            <tr><td class="text-muted" style="padding:7px 0">Type</td><td style="text-align:right">${p.type}</td></tr>
            <tr><td class="text-muted" style="padding:7px 0">Location</td><td style="text-align:right">${p.locality}, ${p.city}</td></tr>
            <tr><td class="text-muted" style="padding:7px 0">Area</td><td style="text-align:right">${p.area} ${p.areaUnit}</td></tr>
            <tr><td class="text-muted" style="padding:7px 0">Posted</td><td style="text-align:right">${formatDate(p.posted)}</td></tr>
          </table>
        </div>
      </aside>
    </div>

    <!-- Similar properties -->
    <h2 class="section-title mt-4" style="margin-top:56px">Similar Properties</h2>
    <div class="grid grid-3 mt-2" id="similarGrid"></div>
  `;

  /* Gallery interactions */
  const main = document.getElementById("galMain");
  document.getElementById("galThumbs").addEventListener("click", e => {
    const t = e.target.closest("[data-gal]");
    if (!t) return;
    main.src = t.dataset.gal;
    document.querySelectorAll("#galThumbs img").forEach(i => i.classList.toggle("active", i === t));
  });

  /* Lightbox */
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  main.addEventListener("click", () => { lbImg.src = main.src; lb.classList.add("open"); });
  lb.querySelector(".lb-close").addEventListener("click", () => lb.classList.remove("open"));
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });

  /* Similar properties (same type or city) */
  const similar = properties
    .filter(x => x.id !== p.id && (x.type === p.type || x.city === p.city))
    .slice(0, 3);
  document.getElementById("similarGrid").innerHTML = similar.length
    ? similar.map(propertyCard).join("")
    : `<p class="text-muted">No similar listings right now — browse <a href="properties.html" style="color:var(--green-700);font-weight:600">all properties →</a></p>`;
});
