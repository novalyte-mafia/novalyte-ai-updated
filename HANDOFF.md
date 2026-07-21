# Handoff � Traffic / SEO / Analytics Platform Work

Date: 2026-07-19
Repos:

- Public site: `z.ai-novalyte-new-homepage`
- Admin dashboard: `the-dashboard`

## Work completed

### Public site

- Crawlable routes for patients, clinics, directory, workforce, marketplace
- Clinic profile route `/directory/[state]/[city]/[slug]` (published-only)
- Sitemap + robots hardened; canonical domain redirect for www
- Site config, OG image route, 404/error pages with analytics
- Privacy-safe analytics client + journey events (general, journal, directory, patient, clinic apply, workforce)
- Public clinic loader fail-closed via publication gate
- Migration: `supabase/migrations/20260719101830_harden_clinic_publication_workflow.sql`
- Docs: `SEO-AUDIT.md`, `TRAFFIC-LAUNCH-PLAN.md`, `ANALYTICS-EVENTS.md`, `HANDOFF.md`

### Dashboard

- Content Studio: SEO fields, sources/FAQs with URLs, approve-before-publish, video/callout editor hints
- Article API validates reference URLs
- Approval gate: word count + linked sources
- SEO Briefs driven by `INITIAL_SEARCH_BRIEFS` (no fake volumes)
- Traffic Analytics view + `/api/analytics/traffic` PostHog HogQL adapter
- Content Performance rewritten to live PostHog (no mock metrics)

## Key files changed

### Public site (representative)

- `src/app/{patients,directory,workforce,marketplace,clinics}/page.tsx`
- `src/app/directory/[state]/[city]/[slug]/page.tsx`
- `src/app/{sitemap,robots,layout,not-found,error,opengraph-image}.*`
- `src/lib/{site-config,public-clinics,platform-data,analytics-client,seo}.ts`
- `src/components/site/{platform-route,analytics-manager,analytics-event,not-found-event}.tsx`
- `src/components/views/{directory-view,article-view,assessment-experience,clinic-*,job-detail-view,*onboarding*}.tsx`
- `next.config.ts`
- `supabase/migrations/20260719101830_harden_clinic_publication_workflow.sql`

### Dashboard (representative)

- `src/components/admin/views/{content-studio,seo-briefs,traffic-analytics,content-performance,directory}.tsx`
- `src/components/admin/content/article-mdx-editor.tsx`
- `src/components/admin/{admin-app,shell/sidebar}.tsx`
- `src/app/api/analytics/traffic/route.ts`
- `src/app/api/content/articles/**`
- `src/app/api/directory/[id]/route.ts`
- `src/lib/content/{article-store,markdown-blocks,initial-search-briefs}.ts`
- `src/lib/journal-article-v1.ts`

## Database changes

- New publication columns + indexes on `prospect_directory_profiles`
- `private.is_public_clinic(uuid)` helper
- RLS on `Clinic`, `ClinicLocation`, `ClinicProvider`, `ClinicTreatment`, `ClinicReview` restricted to published projection
- `REVOKE ALL` on prospect directory profiles from anon/authenticated; service_role only

**Important:** Apply the migration on the **application** Supabase project (`iuuhcnwqozjrehmgpcqo`), not a mismatched MCP project.

## Environment variables

### Public site

- Existing: `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_GTM_CONTAINER_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, Supabase keys

### Dashboard (new for traffic reporting)

- `POSTHOG_PERSONAL_API_KEY` (server-only)
- `POSTHOG_PROJECT_ID` (server-only)
- `POSTHOG_API_HOST` optional (default `https://us.posthog.com`)

## Deployment steps

1. Ensure clinic publication migration is applied on production Supabase
2. Deploy public site to Vercel production
3. Deploy dashboard to Vercel; set PostHog personal API env vars
4. Smoke-test routes listed in `SEO-AUDIT.md`
5. Submit sitemap in Search Console
6. Do **not** flip Dialpad to live until founder calling dry-run is done (separate workstream)

## Testing completed (local)

- TypeScript check on dashboard after traffic-route fix
- Lint diagnostics on edited analytics/content files (clean at last check)
- Manual code verification of publication gate, sitemap composition, event hooks

Still required after deploy:

- Production curl of robots/sitemap/public routes
- PostHog Live event walkthrough with consent
- Build on CI / Vercel without ignoreBuildErrors
- Confirm zero public rows for unpublished prospects

## Known problems

1. **Not deployed yet** � production may still serve old hash/404 routes until ship
2. **No published clinics yet** � directory SEO pages appear only after real permission + approval
3. **PostHog admin credentials** may be unset ? Traffic Analytics shows empty configured=false state (correct)
4. **Distance radius filter** cannot sort by true geolocation until clinic coordinates exist
5. **Dialpad** still mock mode for founder calling (unrelated but noted)
6. Some older admin analytics views (sales funnel etc.) may still use operational approximations ? Traffic Analytics is the verified website adapter

## Clinic Portal (`portal.novalyte.io`) ? 2026-07-20

Architecture: same Next.js app + host middleware; admin stays separate. Full write-up: `docs/PORTAL_ARCHITECTURE.md`.

### Shipped
- Portal shell with clinic sign-out, full IA nav, auth pages (forgot/reset)
- Layout session gate for `/clinic/*` (except sign-in/reset)
- Multi-org status API + claim search + in-portal claim
- Profile PUT upserts Location/Provider/Treatment; no fake analytics
- Team invites (`portal_invitations`), messages (`portal_notifications`)
- Lead workflow status `contacted`; assessment/consultation ? lead RPCs
- Admin Patient Leads wired to live `/api/patient-leads` + assign
- Public clinics page CTA ? portal sign-in

### Ops checklist
- [ ] Supabase Auth redirect allowlist includes `https://portal.novalyte.io/**` and callback URLs
- [ ] Tenant isolation smoke (clinic A cannot read clinic B assignments)
- [ ] Confirm `portal.novalyte.io` serves `/clinic` after deploy

## Campaign Studio & Landing Pages — 2026-07-20

Architecture: `the-dashboard/docs/CAMPAIGN_STUDIO_ARCHITECTURE.md`  
Proof checklist: `the-dashboard/docs/CAMPAIGN_STUDIO_PROOF.md`  
Public routes: `docs/CAMPAIGN_LANDING_PAGES.md`

### Shipped
- Replaced Growth nav with Campaign Studio (wizard, overview, detail, landing pages, page editor with Assessment tab, templates, analytics)
- Supabase `cs_*` schema + assessment templates; every conversion LP auto-binds embedded assessment
- Organic `/find/[service]/[state]/[city]` + paid `/ads/[slug]` with `ads.novalyte.io` middleware redirects
- Assessment stays on-page (`AssessmentExperience` variant=embedded); attribution to `cs_page_id` / `cs_campaign_id`
- Supporting article API → Content Studio draft

### Ops checklist
- [ ] Attach `ads.novalyte.io` in Vercel (`novalyte-ai-updated`)
- [ ] Set `CAMPAIGN_REVALIDATE_SECRET` (both apps) + `CAMPAIGN_REVALIDATE_URL` on dashboard
- [ ] Run Scenario A smoke: publish TRT Beverly Hills → complete embedded assessment → verify lead attribution

## Remaining priorities (exact next actions)

1. Deploy both apps + confirm portal host + ads host
2. Configure dashboard PostHog reporting env + campaign revalidate secrets
3. Publish article #1 from SEO Briefs (How to Choose a TRT Clinic) after human writing/review
4. Continue clinic permission calls; publish first approved profiles
5. Search Console verification + sitemap submit
6. Campaign Studio Scenario A–E smoke after deploy (see CAMPAIGN_STUDIO_PROOF.md)
