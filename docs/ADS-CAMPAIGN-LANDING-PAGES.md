# Ads campaign landing pages (`ads.novalyte.io`)

## URL structure

Preferred public URLs (clean — no `/ads` in the browser):

| Public URL | Internal App Router path | Notes |
|------------|--------------------------|-------|
| `https://ads.novalyte.io/` | `/ads` | Neutral campaign hub (does **not** redirect to novalyte.io) |
| `https://ads.novalyte.io/trt/phoenix-az` | `/ads/trt/phoenix-az` | Treatment × location |
| `https://ads.novalyte.io/longevity/beverly-hills-ca` | `/ads/longevity/beverly-hills-ca` | |
| `https://ads.novalyte.io/sexual-health/palo-alto-ca` | `/ads/sexual-health/palo-alto-ca` | |
| `https://ads.novalyte.io/campaign/phoenix-trt-july` | `/ads/campaign/phoenix-trt-july` | Named non-geo campaign |

Legacy flat slugs still work: `ads.novalyte.io/{slug}` → `/ads/{slug}`.

Optional query: `?campaign=phoenix-trt-july` (attribution overlay; page still resolves by path).

## Architecture

- Data: Campaign Studio `cs_campaigns`, `cs_pages`, `cs_page_versions.blocks`, `cs_page_clinics`
- Shared template: `CampaignLandingPage` + `CampaignAdsShell` + `EmbeddedAssessment`
- Lookup: published pages only (`status=published`)
- Ads host middleware **rewrites** (does not redirect) so URLs stay clean
- Paid publish default: `indexing_policy = noindex_follow` unless explicitly indexed
- Sitemap on ads host: only `index_follow` published pages

### Page block types (config-driven)

| `type` | Purpose |
|--------|---------|
| `value_props` | Trust / benefit cards |
| `answer_cards` | High-intent Q&A (public only when `status` omitted or `approved`) |
| `cost_factors` | Compact pricing-factor list |
| `how_it_works` | Optional steps (fallback static copy if absent) |
| `faq` | Limited FAQ |

### Logo behavior

- Campaign page: logo scrolls to `#campaign-hero` (stays in funnel)
- Hub: logo links to `ads.novalyte.io/` (`/`)
- Logo never navigates to `novalyte.io`

### Find Clinics

- Secondary CTA; opens main directory in a **new tab**
- Built by `buildDirectoryUrl()` in `src/lib/campaigns/directory-url.ts`
- Real directory contract requires `view=directory` plus optional `q`, `state`, `city`, `treatment`, etc.
- Example Phoenix TRT:

```
https://novalyte.io/directory?view=directory&q=testosterone&state=AZ&city=Phoenix&treatment=Testosterone%20Replacement%20Therapy
```

- Tracked as `campaign_find_clinics_clicked` / `campaign_directory_opened`

## Create a new campaign (admin)

1. Campaign Studio → Wizard → paid campaign → treatment + geo (+ clinics)
2. Generate pages → edit copy / blocks in Page Editor
3. Bind assessment (required for paid conversion)
4. Approve → Publish
5. Public URL: `https://ads.novalyte.io/{treatment}/{location}` or `https://ads.novalyte.io/campaign/{slug}` for named pages (`path` = `/ads/campaign/{slug}`)

## Assign a clinic

- Wizard targets or `cs_page_clinics` primary clinic
- Leads store `cs_page_id` + `cs_campaign_id`

## Configure an assessment

- Bind CS template, or set `form_config.assessment_slug` (e.g. `testosterone-replacement-therapy`)

## Publish / pause / archive

- Studio page actions
- Draft / paused / archived are not publicly resolvable
- Paid pages default **noindex, follow**

## Analytics (non-PHI)

Events include: `campaign_landing_viewed`, `campaign_primary_cta_clicked`, `campaign_find_clinics_clicked`, `campaign_directory_opened`, `campaign_answer_expanded`, `campaign_contextual_cta_clicked`, `campaign_assessment_*`.

Never send assessment answers, symptoms, or diagnoses to PostHog/GTM.

## Compliance copy rules

Do not publish claims that Novalyte diagnoses, guarantees eligibility/treatment/appointments/matches, or is itself a treating clinic. Prefer “informational assessment” and “licensed providers decide.”

Do not publish numerical price ranges without an approved, dated source.

## Demand Intelligence (prepared, not auto-published)

TypeScript contract: [`src/lib/campaigns/demand-intelligence.ts`](../src/lib/campaigns/demand-intelligence.ts)

Suggested workflow:

`Demand signal detected → Campaign opportunity created → Content drafted → Human reviewed → Approved → Published`

`DemandCampaignOpportunity` holds query, cluster, treatment, geo, internal volume/CPC/competition (never public), intent, suggested slug/hero/answers/assessment/directory filters, plus content/compliance/publication status and last-reviewed.

`canPublishFromDemandOpportunity()` requires approved content, cleared compliance, ready_to_publish, assessment/path, and lastReviewed. Raw AI drafts must not auto-publish.

## Sample seed

```bash
node scripts/seed-sample-ads-campaigns.mjs
```

Creates sample published `noindex_follow` pages (`settings.sample=true`), including Phoenix TRT answer cards + cost factors and a named `/campaign/phoenix-trt-july` route.

When gate-published clinics exist for the campaign state, the seed attaches up to three via `cs_page_clinics` (city match preferred). Samples remain marked `settings.sample=true` and are not production partners.

## Env

No new secrets. Existing Supabase + PostHog (+ optional campaign revalidate secrets).

## Limitations

- Assessment question editor in admin remains thin
- Demand Intelligence admin UI is not built yet (types + publish gate only)
- Samples are not production clinic partners even when clinics are attached for demo
