# Ads campaign landing pages (`ads.novalyte.io`)

## URL structure

Preferred public URLs (clean — no `/ads` in the browser):

| Public URL | Internal App Router path | Treatment | Location |
|------------|--------------------------|-----------|----------|
| `https://ads.novalyte.io/trt/phoenix-az` | `/ads/trt/phoenix-az` | TRT | Phoenix, AZ |
| `https://ads.novalyte.io/longevity/beverly-hills-ca` | `/ads/longevity/beverly-hills-ca` | Longevity | Beverly Hills, CA |
| `https://ads.novalyte.io/sexual-health/palo-alto-ca` | `/ads/sexual-health/palo-alto-ca` | Sexual health | Palo Alto, CA |

Legacy flat slugs still work: `ads.novalyte.io/ads/{slug}` and rewritten `ads.novalyte.io/{slug}`.

Optional query: `?campaign=phoenix-trt-july` (attribution overlay; page still resolves by path).

## Architecture (extends Campaign Studio)

- Data: `cs_campaigns`, `cs_pages`, `cs_page_versions`, `cs_page_clinics`, assessment bindings
- Render: `CampaignLandingPage` + `EmbeddedAssessment` (same template for every campaign)
- Lookup: `getPublishedPageByPath('/ads/{treatment}/{location}')` — only `status=published`
- Ads host middleware **rewrites** (does not redirect) so URLs stay clean
- Paid publish default: `indexing_policy = noindex_follow` unless explicitly indexed
- Sitemap on ads host: only `index_follow` published pages

## Create a new campaign (admin)

1. Open admin → Campaign Studio → Wizard
2. Create a **paid** campaign, pick treatment vertical + geo target (+ clinics)
3. Generate pages → edit copy in Page Editor
4. Bind assessment (required for paid conversion pages)
5. Approve → Publish
6. Copy public URL: `https://ads.novalyte.io/{treatment}/{location}`

Generated path format: `/ads/{vertical}/{geo}` (slug stores `{vertical}/{geo}`).

## Assign a clinic

- In Campaign Wizard targets, select clinic IDs, **or**
- In Page Editor / page clinics (`cs_page_clinics`) set primary clinic

Leads and assessments store `cs_page_id` + `cs_campaign_id`.

## Configure an assessment

- Bind a CS assessment template to the page, **or**
- Set `form_config.assessment_slug` to an engine slug such as:
  - `testosterone-replacement-therapy`
  - `erectile-dysfunction`
  - `medical-weight-loss`
  - `longevity-medicine`

Assessment stays on the landing page (`below_hero` by default).

## Publish / pause / archive

- Publish / pause / archive from Campaign Studio page actions
- Draft / paused / archived pages are **not** publicly resolvable
- Publishing paid pages defaults to **noindex, follow** unless you pass index=true / set policy to `index_follow`

## Leads & analytics

- Submissions: `/api/assessment` → `AssessmentSubmission` → `patient_leads` + Forms inbox
- PostHog: `page_view`, `campaign_landing_viewed`, `campaign_assessment_*` with `campaign_treatment`, `campaign_location`, `campaign_slug`
- Admin: Forms & Notifications + Campaign Analytics + Live Website Activity (replay links when `$session_id` present)
- Sensitive assessment answers are not sent to PostHog properties (masked / excluded)

## Sample seed

Migration: `supabase/migrations/20260723110000_sample_ads_treatment_location_campaigns.sql`

Creates three **Sample ·** published, `noindex_follow` campaigns marked `settings.sample=true`.

## Env

No new secrets. Existing:

- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (+ hosts)
- `CAMPAIGN_REVALIDATE_URL` / `CAMPAIGN_REVALIDATE_SECRET` (dashboard → marketing revalidate)

## Limitations / next steps

- Deep assessment question editor in admin is still thin (templates exist)
- Sample pages intentionally noindex — flip to `index_follow` only when approved for organic
- Clinic assignment on samples may be empty until you attach live clinics
- Do not treat seed samples as production clinic partners
