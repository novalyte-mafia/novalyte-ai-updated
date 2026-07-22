# Investor Portal Testing

## Automated tests (this repo)

Vitest unit coverage for:

- Zod schemas (`accessRequestSchema`, `meetingRequestSchema`) — valid + invalid inputs
- Access-code gate (`isValidAccessCode`, `createGateToken`, `verifyGateToken`) — accept, reject, tamper, rotation
- Auth helpers (`hasInvestorAccountType`) — role membership

```bash
npm run test          # vitest run
npm run lint
npx tsc --noEmit
npm run build
```

## Manual smoke checklist (production)

| Step | Expected |
|---|---|
| Open `https://investor.novalyte.io` without cookie | Redirect to gate; no overview copy in HTML |
| Submit wrong code | Error; no cookie |
| Submit correct code | Cookie set; land on overview |
| Navigate `/company`, `/product` | Content loads; honest status labels |
| Submit access request | 200; row in `investor_access_requests`; founder notified if Resend/Slack configured |
| Sign-in without approval | Cannot open `/workspace` / `/data-room` |
| Founder approve + invite | User receives invite; `investor_approved` granted |
| Investor accepts terms | Profile `terms_accepted_at` set |
| Download document | 60s signed URL; `investor_access_events` row |
| Founder revoke | Subsequent download returns 403 |
| Mobile (iPhone / Pixel widths) | Gate + nav usable; no horizontal overflow |
| Accessibility spot-check | Form labels present; focus visible on gate submit |

## RLS verification (SQL / advisors)

Run Supabase advisors after migration changes:

```bash
# via MCP get_advisors or Supabase dashboard Advisors
```

Recommended SQL checks (service role vs anon vs approved JWT):

1. Anon `select` on `investor_documents` → 0 rows
2. Approved investor `select` own profile → allowed
3. Approved investor `select` another profile → denied
4. Pending investor download path → denied at API
5. Revoked investor → denied

## Browser / responsive

- Desktop 1280+, tablet 768, iPhone SE / 14, Pixel 5
- Gate screen, overview nav, access-request form, sign-in, admin request table

## Verification log (July 21, 2026)

| Check | Result |
|---|---|
| `npm run test` (13 unit tests: gate, schemas, auth) | PASS |
| `npx tsc --noEmit` | PASS |
| `npx eslint src/lib/investor src/components/investor src/app/investor src/app/api/investor` | PASS (0 issues) |
| Repo-wide `npm run lint` | Pre-existing errors outside investor paths (marketplace-view, use-clinic-portal, use-mobile) — not introduced by this work |
| `npm run build` (local) | BLOCKED locally — `.env.local` lacks Supabase keys; production Vercel build is the authority |
| Production deploy live | PASS — https://investor.novalyte.io |
| Gate redirect + `private, no-store` | PASS |
| Content leak check (unauthenticated) | PASS |
| Gate a11y markers (labeled input, viewport meta, noindex) | PASS |
| `robots.txt` Disallow `/investor` | PASS |
| Supabase security advisors — investor `rls_enabled_no_policy` | Cleared after `20260721150000_investor_rls_policies` (0 investor-related advisors) |
| SQL: every `investor_*` table has ≥1 policy | PASS |
| Playwright full e2e | Not run (documented manual path) |
| Device lab responsive screenshots | Not run; layout uses responsive Tailwind (`max-w-md`, `px-4`, mobile-first shells) |

## Known gaps

- Full Playwright e2e (request → approve → invite → terms → download → revoke) not yet in CI
- pgTAP RLS suite not yet committed — smoke SQL helpers exist in `supabase/tests/investor_rls_smoke.sql`
- Accessibility audit is manual spot-check, not axe CI
- Local production build requires founder to restore Supabase keys into `.env.local`

Record pass/fail dates here when re-run.
