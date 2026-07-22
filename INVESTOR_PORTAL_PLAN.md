# Investor Portal Plan

**Status:** Implementation complete for the build scope described below. Remaining items are founder/legal inputs and expanded automated verification.

## Goals

1. Ship a production investor workspace at `investor.novalyte.io`.
2. Gate the entire host with access code `1750-44` (env-overridable).
3. Publish only verified facts; omit unpublished fundraising and financial fields.
4. Provide a founder-admin approval → invite → terms → data-room lifecycle.
5. Keep confidential documents private with short-lived signed URLs and audit events.

## Delivery sequence (executed)

1. **Audit & architecture** — host choice, content inventory, risk list (`INVESTOR_PORTAL_AUDIT.md`).
2. **Supabase foundation** — migration `20260721140000_investor_portal.sql`: tables, RLS, `grant_account_type` / `revoke_account_type`, private storage bucket.
3. **Auth & APIs** — SSR client, investor guards, access-request, approve/deny/invite/revoke, documents, metrics, publish, meeting, gate.
4. **Public gated overview** — Overview, Company, Market, Product, Technology, Business Model, GTM, Investment, Contact, Sign In.
5. **Protected workspace** — Workspace, Traction, Financials, Roadmap, Data Room, Updates, Meet.
6. **Founder admin** — Requests, Investors, Documents, Metrics, Fundraising/Terms, Activity.
7. **Security & SEO** — middleware host rewrite + canonicalization, noindex, robots/sitemap exclusion, private cache headers.
8. **Access-code gate** — signed httpOnly cookie; redirect-based `(gated)` layout (no RSC content leak).
9. **Verification & handoff** — unit tests, lint/typecheck/build, advisors, handoff docs.

## Out of scope for this build

- Fabricating market TAM numbers, raise terms, or financial projections
- Coupling authorization to the dashboard HMAC admin session
- Automated email sending of investor outreach (founder-approved only)
- Full Playwright suite in CI (documented manual smoke path; expand next)

## Success criteria

| Criterion | Status |
|---|---|
| Migration applied with RLS | Done |
| Access code gates all routes | Done (live verified) |
| Overview pages render verified content only | Done |
| Access request → founder approve → invite works | Done (API + admin UI) |
| Data room requires approved investor + terms | Done (server) |
| Revocation blocks new signed URLs | Done (role revoke) |
| Noindex / not in sitemap | Done |
| DNS + SSL + live host | Done (`investor.novalyte.io`) |
| Founder bio / raise terms published | **Pending founder input** |
| Counsel-approved legal copy | **Pending attorney review** |
