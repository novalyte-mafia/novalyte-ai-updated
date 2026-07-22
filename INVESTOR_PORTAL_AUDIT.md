# Investor Portal Audit

**Status:** Verified against production and source as of July 21, 2026  
**Host:** `https://investor.novalyte.io`  
**Repository:** `z.ai-novalyte-new-homepage`

## Decision summary

Build the investor portal **inside the marketing Next.js app** (not the dashboard), using host-aware middleware rewrites so `investor.novalyte.io/company` maps to `/investor/company`. This reuses the existing Vercel project, design tokens, Supabase admin client, and `app_metadata.account_types` authorization pattern.

## Repository fitness

| Capability | Evidence | Verdict |
|---|---|---|
| Next.js App Router + TypeScript | `package.json` (Next 16.2.10, React 19) | Fit |
| Host routing for subdomains | `src/middleware.ts` (portal / ads patterns) | Fit — extended for investor |
| Design system (light, teal, editorial) | `src/app/globals.css`, Lora via `next/font` | Fit |
| Supabase service-role server client | `src/lib/supabase/admin.ts` (`server-only`) | Fit |
| Role grants via `app_metadata` | `grant_account_type` / workforce auth | Fit — extended for investor roles |
| SSR session validation | Added `@supabase/ssr` + `src/lib/supabase/ssr.ts` | Required and shipped |
| Private document storage pattern | Professional-documents migration + signed URLs | Fit — cloned for data room |
| Separate dashboard HMAC admin | `the-dashboard/src/lib/auth.ts` | **Do not couple** — founder admin lives in the investor app |

## Verified live surface (July 21, 2026)

- DNS `investor.novalyte.io` → Vercel (`76.76.21.21`)
- HTTPS / SSL working
- Unauthenticated `/` and `/company` redirect to `/investor/gate`
- Gate HTML contains access-code UI only; investor overview copy is **not** present in the unauthenticated response (RSC leak check passed after redirect-based gate)
- `robots: noindex` on investor routes; `/investor` disallowed in `robots.ts`; not in sitemap

## Content source inventory

**Safe to publish (verified product facts):**

- Company positioning from about/constants/clinic FAQs
- Product modules with honest Completed / In progress / Planned statuses
- Founder ops identity: Jamil Yakasai, `founder@novalyte.io`
- Technology facilitator notice (Novalyte is not a medical provider)

**Explicitly excluded from investor content:**

- Dashboard mocks, ROI calculator defaults, illustrative demo metrics
- Stripe sandbox checkout claims
- Draft legal-page text as final counsel language
- Stale discovery row counts, fictional team/MRR UI

**Founder-only gaps (omit, do not invent):**

- Founder biography, photo, LinkedIn
- Headquarters / corporate entity package
- Cited market-sizing dataset
- Raise amount, instrument, valuation/cap, use of funds detail
- Financial model assumptions and series
- Scheduling link
- Counsel-approved legal language
- Approved product screenshots

## Principal risks addressed

| Risk | Mitigation shipped |
|---|---|
| Client-only session gate | Supabase SSR + server guards |
| Privilege escalation via user_metadata | Roles only from JWT `app_metadata.account_types` |
| Content leakage through RSC | `(gated)` layout redirects before page render |
| Service-role leakage | `server-only` admin module; never imported in client |
| IDOR on documents | Server ACL + approved status + terms check before signed URL |
| Public storage | Private `investor-data-room` bucket; no public policies |
| Stale signed URLs after revoke | 60s signed URLs; revoke removes role so new mint fails |
| Indexing / caching of private pages | `noindex`, sitemap exclusion, private/no-store on gate redirect |
| Shared access-code leak | Code rotation invalidates prior cookies via embedded HMAC |

## Audit conclusion

Architecture choice is correct. Portal is launchable for invited investors with the access code. Remaining work is founder content publication, attorney legal review, Vitest/RLS automated coverage expansion, and the documentation set this audit begins.
