# novalyte.io SEO indexing

## Indexable hosts (required)

| Host | Status |
|------|--------|
| `https://novalyte.io` | **Indexable** — public marketing + Journal |
| `https://ads.novalyte.io` | **Indexable** — public landing / campaign pages |

## What stays private / noindex

- `/clinic/*`, `/investor/*`, `/auth/*`, `/api/*`
- `/workforce/professional/*`, `/workforce/employer/*`
- `/journal/preview/*`
- Demo clinic profiles

## Enforcement

1. `robots.txt` — host-aware; allows marketing + ads; disallows backends
2. Ads middleware bypasses `/robots.txt` and `/sitemap.xml` (so ads host serves real SEO files)
3. Ads layouts/pages use `INDEXABLE_ROBOTS`
4. Dashboard publishes ads pages with `indexing_policy = index_follow`
5. Sitemaps:
   - `https://novalyte.io/sitemap.xml` — marketing + Journal + ads.novalyte.io landers
   - `https://ads.novalyte.io/sitemap.xml` — ads landers only
