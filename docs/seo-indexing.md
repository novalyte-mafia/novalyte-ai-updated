# novalyte.io SEO indexing

## Goal

Index public marketing pages. Keep backends, portals, auth, and ads out of Google.

## What is indexable

- Home, patients, clinics, directory, workforce hub, marketplace, journal (+ categories + published articles)
- About, contact, legal pages
- Published clinic profiles (non-demo)
- Organic `/find/...` campaign pages only when marked `index_follow`

## What stays private / noindex + robots disallow

- `/clinic/*` — clinic portal / dashboards / sign-in
- `/investor/*` — investor data room
- `/ads/*` — paid campaign landers (forced noindex)
- `/auth/*` — auth callbacks
- `/api/*` — APIs
- `/journal/preview/*` — draft previews
- `/workforce/professional/*` and `/workforce/employer/*` — account portals
- Demo clinic profiles

## Enforcement layers

1. `src/app/robots.ts` — crawl disallow for internal prefixes
2. Layout `robots: NOINDEX_ROBOTS` on clinic, investor, ads, auth, workforce portals
3. `sitemap.xml` — public URLs only (no portals/ads/auth)

## Live checks

- `https://novalyte.io/robots.txt`
- `https://novalyte.io/sitemap.xml`
- Pillar: `/journal/low-testosterone-ed-fatigue-weight-gain-mens-health-clinic`

## Google Search Console (manual)

1. Verify `novalyte.io`
2. Submit sitemap
3. Use Removals / Page indexing if any portal URL was ever crawled
4. Request indexing for public Journal URLs only
