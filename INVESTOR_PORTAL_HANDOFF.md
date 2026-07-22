# Investor Portal Handoff

**Date:** July 21, 2026  
**Owner:** Founder (Jamil Yakasai) + engineering agent session  
**Live:** https://investor.novalyte.io (access code from `INVESTOR_ACCESS_CODE`, default `1750-44`)

## What was completed

- Route-aware investor portal inside the marketing Next.js app
- Access-code gate with signed httpOnly cookie + redirect-based `(gated)` layout (no RSC leak)
- Supabase migration with investor tables, RLS, grant/revoke helpers, private `investor-data-room` bucket
- SSR auth (`@supabase/ssr`), founder admin, access-request → approve/invite/revoke
- Document upload + signed-URL download with audit events
- Metrics upsert, updates/terms publish APIs
- Meeting + access-request notifications (Resend / Slack when configured)
- Gated overview pages (Company, Market, Product, Technology, Business Model, GTM, Investment, Contact)
- Protected workspace (Workspace, Traction, Financials, Roadmap, Data Room, Updates, Meet)
- Founder admin pages (Requests, Investors, Documents, Metrics, Fundraising, Activity)
- Middleware host rewrite + canonicalization; robots/sitemap exclusion; noindex
- DNS + SSL live on `investor.novalyte.io`
- Documentation set: Audit, Plan, Architecture, Database, Security, Content Gaps, Deployment, Testing, Handoff
- Vitest unit tests for schemas, gate, and role helpers (13/13 passing)
- Follow-up migration `20260721150000_investor_rls_policies.sql` clearing advisor `rls_enabled_no_policy` warnings on 8 tables
- Live smoke: gate redirect, leak check, noindex, robots disallow, viewport meta

## Verification snapshot (July 21, 2026)

| Check | Status |
|---|---|
| Unit tests | PASS |
| Typecheck | PASS |
| Investor-path ESLint | PASS |
| Supabase investor advisors | PASS (0 investor-related) |
| Live production smoke | PASS |
| Local `npm run build` | Blocked by missing local Supabase secrets; Vercel production is authoritative |
| Playwright e2e / device lab | Documented; not automated yet |

## What remains (founder / legal)

See `INVESTOR_PORTAL_CONTENT_GAPS.md`. Highest priority before wide outreach:

1. Reword attorney-placeholder footer language (keep disclaimers; remove the word “placeholder”)
2. Add founder bio + photo + LinkedIn
3. Replace Investment page “Founder input required” system phrasing with deliberate conversational copy or real terms
4. Publish access terms via admin before inviting investors into the data room
5. Seed Actual traction metrics + upload first data-room PDFs
6. Confirm Production env: `INVESTOR_GATE_SECRET`, `INVESTOR_ACCESS_CODE`, Resend/Slack notify vars

## Files changed (primary)

```
src/middleware.ts
src/app/robots.ts
src/app/investor/**                    # layouts, gate, (gated) pages
src/app/api/investor/**                # gate, access-request, meeting, documents, admin/*
src/components/investor/**
src/lib/investor/**
src/lib/supabase/ssr.ts
src/lib/supabase/browser.ts
supabase/migrations/20260721140000_investor_portal.sql
INVESTOR_PORTAL_*.md                   # this documentation set
vitest.config.ts / src/lib/investor/__tests__/**
package.json                           # test script + vitest (if added)
```

## Migrations added

- `supabase/migrations/20260721140000_investor_portal.sql` — applied
- `supabase/migrations/20260721150000_investor_rls_policies.sql` — applied

## Environment variables required

See `INVESTOR_PORTAL_DEPLOYMENT.md`. Minimum for safe production: Supabase trio + `INVESTOR_ACCESS_CODE` + `INVESTOR_GATE_SECRET`.

## How to run locally

```bash
cd z.ai-novalyte-new-homepage
npm install
npm run dev
# http://localhost:3000/investor/gate  or  http://investor.localhost:3000
```

## How to test

```bash
npm run test
npm run lint
npx tsc --noEmit
npm run build
```

Plus manual smoke in `INVESTOR_PORTAL_TESTING.md`.

## How to deploy

Push to `main` (Vercel production). Confirm domain `investor.novalyte.io` remains attached. Re-run smoke curls from Deployment doc.

## How to connect the subdomain

Already connected: Hostinger A record `investor` → `76.76.21.21`, Vercel domain + SSL. If recreating: add domain in Vercel → create Hostinger A/CNAME as instructed → wait for SSL.

## Known risks

1. Shared access code for overview layer (rotate if leaked)
2. Unpublished access terms block proper data-room invites until founder publishes
3. Visible attorney-placeholder footer copy
4. Solo-founder operational risk (not a portal bug)
5. Playwright/pgTAP automation still thin

## Recommended next steps

1. Complete Content Gaps P1 items (30–60 minutes of founder input)
2. Invite yourself as `founder_admin` if not already; walk approve → invite → download once
3. Upload first three data-room documents
4. Seed Actual metrics from clinic outreach tracker
5. Only then share `investor.novalyte.io` + access code with external investors
