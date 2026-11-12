# Acres Properties — Real Estate Website (Phase 1)

A modern Zillow-style real estate marketplace for India, built for **Acres Properties**
(acreslands.com). Static, database-free, and deploy-ready for Vercel.

## What's inside (Phase 1)

| Page | Purpose |
|---|---|
| `index.html` | Hero search, category tiles, featured & recent listings, stats, testimonials |
| `properties.html` | Full search + filters (status, type, location, budget, beds) with shareable URLs |
| `property.html` | Property detail: gallery + lightbox, specs, amenities, enquiry form, agent card, similar listings |
| `about.html` | Company story, stats, agents |
| `contact.html` | Contact form + info cards + map |
| `admin.html` | **Password-protected admin panel** — add/edit/duplicate/delete properties, toggle featured, edit site settings, export/import data |

## Key features

- **Admin controllable** — everything (listings, phone, WhatsApp, email, hero copy, stats)
  is editable at `/admin.html`. Default password: `acres@2026` *(change it in
  Admin → Settings or `assets/js/data.js` before going live).*
- **No database** (by design, Phase 1) — admin edits persist in the browser's
  `localStorage`; use **Export** to download `acres-data.json` and commit it to publish.
- **Forms via [formsubmit.co](https://formsubmit.co)** — contact, property enquiry and
  newsletter forms all deliver to `info@acreslands.com` (no backend needed).
  > First submission triggers a one-time confirmation email from formsubmit.co —
  > confirm it once and all future submissions flow through.
- **Search** — hero search + full filter toolbar, live filtering, sort options,
  deep-linkable URL params.
- Favourites (♥), WhatsApp deep links, animated counters, lightbox gallery, toasts,
  back-to-top, fully responsive.

## Publish flow (Admin → Export)

1. Make edits in `/admin.html`.
2. Click **Download acres-data.json** (or **Copy JSON**).
3. Replace the `PROPERTIES_SEED` / `SITE_DEFAULTS` content in `assets/js/data.js`
   with the exported JSON, or simply commit `acres-data.json` alongside.
4. Push to GitHub → Vercel redeploys automatically.

## Image licensing

All property, category and hero photography is sourced from [Unsplash](https://unsplash.com)
and used under the **Unsplash License** — free for commercial use, no attribution required,
no paid tiers. Every referenced URL is verified working (HTTP 200). The only proprietary
asset is the Acres Properties logo (`assets/img/logo.png`), owned by the business.

If you later swap in your own property photos (recommended for live listings), replace the
`image` / `images` URLs in `assets/js/data.js` — or upload them via the Admin panel fields.

## Run locally

No build step — just open `index.html` in a browser, or serve it:

```bash
npx serve .        # or: python -m http.server
```

> The admin panel and favourites use `localStorage`, which works best over
> `http://localhost` rather than `file://`.

## Deploy

**GitHub:** create a repo and push this folder.

**Vercel:** Import the GitHub repo → framework preset **Other** (static) → Deploy.
`vercel.json` already enables clean URLs.

## Phase 2 (planned)

- Real database + API (listings, leads, agents)
- True multi-user admin with roles
- Image uploads, CSV import, analytics dashboards
