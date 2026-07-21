# Campaign Landing Pages

Public Campaign Studio pages render on the marketing site with an **embedded patient assessment** — users never leave the landing page to complete the flow.

## Routes

| Route | Host | Purpose |
|-------|------|---------|
| `/find/[service]/[state]/[city]` | `novalyte.io` (organic) | SEO service-location pages |
| `/ads/[slug]` | `novalyte.io` or ads subdomain | Paid conversion pages |
| `/ads` | either | Ads index / placeholder |

### Ads subdomain

Attach **`ads.novalyte.io`** in Vercel (same project as the marketing site). Middleware redirects:

- `ads.novalyte.io/` → `/ads`
- `ads.novalyte.io/trt-la` → `/ads/trt-la`

Local dev hosts: `ads.localhost`, `ads.local` (add to `/etc/hosts` if needed).

Portal middleware (`portal.novalyte.io` → `/clinic/*`) is unchanged.

## Data loading

Server loader: `src/lib/campaigns/public-pages.ts`

- Uses **service-role** Supabase (`getSupabaseAdmin()`)
- Only returns pages with `status = 'published'`
- Joins `cs_page_versions.blocks` at `current_version`
- Clinics from `cs_page_clinics` filtered through the public directory publication gate
- Assessment slug from `form_config.assessment_slug` or vertical mapping:

| CS vertical | Assessment engine slug |
|-------------|------------------------|
| `trt` | `testosterone-replacement-therapy` |
| `sexual-health` | `erectile-dysfunction` |
| `weight-management` | `medical-weight-loss` |
| `glp-1` | `glp-1` |
| `peptides` | `peptide-therapy` |
| `hair-restoration` | `hair-restoration` |
| `telehealth` | `testosterone-replacement-therapy` |
| `primary-care` | `hormone-optimization` |

Cache tag: `campaign-pages` (revalidated from dashboard on publish).

## Embedded assessment

Component: `src/components/campaign/embedded-assessment.tsx`

Wraps `AssessmentExperience` with `variant="embedded"`:

- In-page scroll container (not fullscreen)
- Prefills location from page geo when known
- Passes campaign attribution to `POST /api/assessment`
- Fires privacy-safe events: `campaign_assessment_viewed|started|completed`

Placements come from `cs_pages.assessment_placement` (default `below_hero`).

## APIs

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/campaigns/revalidate` | Bearer `CAMPAIGN_REVALIDATE_SECRET` (falls back to `JOURNAL_REVALIDATE_SECRET`) | Invalidate campaign cache |
| `POST /api/campaign-leads` | Public | Optional non-assessment contact leads → `patient_leads` |
| `POST /api/assessment` | Public | Extended with `csPageId`, UTM fields, auto-promote to leads |

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Shared with dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only; loads `cs_*` tables |
| `CAMPAIGN_REVALIDATE_SECRET` | prod | Dashboard POST on publish |
| `JOURNAL_REVALIDATE_SECRET` | fallback | Used if campaign secret unset |

Dashboard (separate repo) also needs:

- `CAMPAIGN_REVALIDATE_URL` → `https://novalyte.io/api/campaigns/revalidate`
- `CAMPAIGN_REVALIDATE_SECRET` → same value as marketing site

## Database migrations

Marketing site `supabase/migrations/`:

- `20260720160000_campaign_studio_schema.sql`
- `20260720170000_campaign_studio_assessments.sql`
- `20260720180000_assessment_campaign_attribution.sql` — adds `csPageId`, `csCampaignId`, `attributionJson` to `AssessmentSubmission`

Apply with Supabase CLI or MCP before pages will resolve in production.

## Sitemap

Indexable organic pages (`host=organic`, `indexing_policy=index_follow`) are included in `/sitemap.xml` via `listIndexableOrganicPaths()`.

## Publishing flow

1. Create/generate pages in Campaign Studio (dashboard)
2. Approve → Publish
3. Dashboard calls `POST /api/campaigns/revalidate` with `{ paths: ["/find/..."] }`
4. Page is live with embedded assessment

## Medical disclaimer

All campaign LPs render `DisclaimerBanner` — informational only, no diagnosis or eligibility guarantees.
