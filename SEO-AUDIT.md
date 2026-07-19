# Novalyte AI Search, Publishing, Analytics, and Privacy Audit

Audit date: 2026-07-19
Last updated: 2026-07-19 (post-implementation)

## Executive summary

Novalyte AI now has crawlable public routes, a fail-closed clinic publication gate, a Journal approval workflow for long-form content, privacy-safe analytics events, and an admin Traffic Analytics adapter. The remaining blockers are operational, not architectural: deploy the public-site and dashboard changes, configure PostHog reporting credentials in the dashboard, publish the first five editorial briefs as real articles, and complete Search Console setup.

## What already works (verified in code)

### Technical SEO foundation

- Real App Router pages: `/`, `/patients`, `/clinics`, `/directory`, `/workforce`, `/marketplace`, `/journal`, `/about`, `/contact`, `/directory/[state]/[city]/[slug]`
- Dynamic sitemap at `/sitemap.xml` includes main routes, published Journal articles/categories, and only approved published clinic profiles
- `robots.txt` allows public pages and blocks `/api`, `/admin`, auth, Journal previews, and private workforce areas
- Canonical host redirect: `www.novalyte.io` ? `https://novalyte.io`
- Shared site config in `src/lib/site-config.ts` (`SITE_URL = https://novalyte.io`)
- Root Organization + WebSite JSON-LD; Article/Breadcrumb/FAQ helpers for Journal; MedicalClinic JSON-LD only for published profiles
- Preview routes remain `noindex` / `nofollow`
- `typescript.ignoreBuildErrors` removed from public-site `next.config.ts`

### Journal / Content Studio

- Long-form editor with headings, lists, tables, quotes, links, images, Source mode for video embeds, Tip/Warning/Note callouts
- SEO fields: title, slug, excerpt, meta title/description, keywords, canonical, noindex, tags, hero image/alt/caption, author, reviewer, dates, category, status
- Sources & FAQs editable in studio; approval requires ?1200 words and ?2 linked sources
- Publish/schedule requires `approved` status first
- Public article pages include TOC, references, CTAs, related articles, read-depth analytics

### Clinic directory privacy

- Migration `20260719101830_harden_clinic_publication_workflow.sql` gates public `Clinic*` RLS through `private.is_public_clinic`
- Public loader `listPublishedClinics()` only returns profiles that are verified, approved, published, and permission-backed
- Prospect tables remain service-role only
- Directory cards link to crawlable `/directory/[state]/[city]/[slug]` URLs

### Analytics

- Consent-gated PostHog + GTM `dataLayer` push via `captureSafeEvent`
- Sensitive property keys stripped (answers, medical, passwords, tokens, email, phone, etc.)
- Identify uses `app_metadata.role` only (no email in identity properties)
- Session recording masks all text
- Admin Traffic Analytics queries PostHog HogQL when `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID` are set; shows empty states otherwise (no fake metrics)
- Content Performance view uses the same live adapter (mock metrics removed)

### Initial search content architecture

- Five editorial briefs in dashboard `INITIAL_SEARCH_BRIEFS` / SEO Briefs view
- Structures only ù no invented medical claims, volumes, or rankings

## Problems discovered (original audit)

| Risk | Issue | Status |
|------|-------|--------|
| Critical | Client-side hash routing for core pages | Fixed in code ù deploy required |
| Critical | Sitemap hash URLs | Fixed |
| Critical | Legacy Clinic rows exposed without publication gate | Fixed (fail-closed) |
| Critical | Prospect DB must stay private | Preserved + hardened |
| High | `novalyte.ai` vs `novalyte.io` canonicals | Fixed to `.io` |
| High | www/non-www both 200 | Fixed via redirect |
| High | `ignoreBuildErrors` | Fixed on public site |
| High | Incomplete event taxonomy / PII in analytics | Largely fixed |
| High | Fake admin analytics | Content Performance + Traffic Analytics no longer invent numbers |
| Medium | Production behind local branch | Remaining ù deploy |

## Remaining work

1. Deploy public site + dashboard to Vercel production
2. Add dashboard env: `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, optional `POSTHOG_API_HOST`
3. Create CMS drafts from the five SEO briefs; human-write and approve before publish
4. Complete clinic outreach ? permission ? approve ? publish workflow before expecting directory SEO pages
5. Google Search Console property + sitemap submit (manual)
6. Distance-based directory sorting still needs clinic coordinates (not invented)

## Search Console setup

1. Open [Google Search Console](https://search.google.com/search-console)
2. Add property `https://novalyte.io` (URL-prefix) or Domain property `novalyte.io`
3. Verify via DNS TXT or Vercel HTML file / meta tag
4. Confirm preferred host is non-www (redirect already enforces this)
5. Submit sitemap: `https://novalyte.io/sitemap.xml`
6. Use URL Inspection on `/`, `/journal`, `/directory`, and one published article
7. Monitor Coverage / Pages for soft-404s and unexpected `noindex`

## Sitemap submission

- Production sitemap URL: `https://novalyte.io/sitemap.xml`
- After each publish wave, re-request indexing for new article and clinic profile URLs
- Do not submit preview, auth, or API paths

## Indexing verification

```bash
curl -sI https://novalyte.io/robots.txt
curl -s https://novalyte.io/sitemap.xml | head
curl -sI https://novalyte.io/patients
curl -sI https://novalyte.io/directory
curl -sI https://novalyte.io/journal
```

Expect `200` on public routes and `X-Robots-Tag: noindex` (or equivalent robots metadata) on previews/private routes.

## Structured-data verification

1. Open a published Journal article ? Rich Results Test / Schema Markup Validator
2. Confirm Article + BreadcrumbList (+ FAQPage when FAQs exist)
3. Open a published clinic profile ? MedicalBusiness/LocalBusiness only with real address/phone fields present on page
4. Reject any schema that invents ratings, doctors, or credentials not shown on page
