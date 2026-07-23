# novalyte.io SEO indexing

## Goal

Make public marketing pages crawlable and indexable so Google can discover Journal articles, directory pages, and core product surfaces.

## What is indexable

- Home, patients, clinics, directory, workforce, marketplace, journal (+ categories + published articles)
- About, contact, legal pages
- Published clinic profiles (non-demo)
- Organic campaign landing pages marked indexable

## What stays private / noindex

- `/investor/*` (gated data room)
- `/clinic/*` portals and dashboards
- `/ads/*` paid landers (default noindex)
- Auth, API, Journal preview tokens
- Workforce employer/professional dashboards and sign-in flows
- Demo clinic profiles

## Live checks

- `https://novalyte.io/robots.txt` — `Allow: /` for public; private paths disallowed
- `https://novalyte.io/sitemap.xml` — public URLs only
- Pillar article: `/journal/low-testosterone-ed-fatigue-weight-gain-mens-health-clinic`

## Google Search Console (manual)

1. Verify `novalyte.io` property
2. Submit `https://novalyte.io/sitemap.xml`
3. Request indexing for the pillar URL and `/journal`
4. Monitor Coverage / Page indexing over 2–6 weeks

Technical SEO enables discovery. Ranking still depends on relevance, links, content quality, and competition.
