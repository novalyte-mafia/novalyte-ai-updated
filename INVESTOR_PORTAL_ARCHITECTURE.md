# Investor Portal Architecture

## Host model

```
investor.novalyte.io/company
        │
        ▼
middleware (INVESTOR_HOSTS)
        │ rewrite → /investor/company
        ▼
src/app/investor/layout.tsx          (fonts + metadata, noindex)
        │
        ├─ /investor/gate            (ungated — access-code entry)
        │
        └─ /investor/(gated)/*       (layout redirects if gate cookie invalid)
                ├─ public overview pages
                ├─ /workspace/*      (approved investor)
                └─ /admin/*          (founder_admin)
```

- Preview deployments remain reachable at `/investor/*` on the main host.
- Production canonical: `novalyte.io/investor/*` → 308 to `investor.novalyte.io`.

## Layers

| Layer | Location | Responsibility |
|---|---|---|
| Host routing | `src/middleware.ts` | Investor host rewrite; Supabase cookie refresh on investor host |
| Access-code gate | `src/lib/investor/gate.ts` + `(gated)/layout.tsx` | HMAC cookie; redirect before page render |
| Content | `src/lib/investor/content.ts` | Verified structured copy; unpublished fields omitted |
| Auth | `src/lib/investor/auth.ts` + `src/lib/supabase/ssr.ts` | Session + `app_metadata` roles |
| Page guards | `guard.ts`, `admin-guard.ts` | Redirect unauthenticated / unauthorized |
| APIs | `src/app/api/investor/**` | Zod-validated mutations; service-role for admin ops |
| Data | Supabase `investor_*` tables + `investor-data-room` bucket | RLS + private storage |
| Audit | `investor_access_events` | Gate unlocks, views, downloads |

## Authorization model

Roles live **only** in `auth.users.raw_app_meta_data.account_types` (JWT `app_metadata`):

- `founder_admin` — full admin
- `investor_pending` — invited, not yet approved workflow complete
- `investor_approved` — workspace + data room (after terms)
- `advisor`, `internal_team` — approved-equivalent read access

Mutations use `grant_account_type` / `revoke_account_type` (security definer). Never trust `user_metadata` or a `profiles.role` column for authorization.

## Access lifecycle

1. Visitor enters access code → gate cookie set.
2. Visitor submits access request → `investor_access_requests` + founder email/Slack.
3. Founder approves → invite user, grant `investor_approved`, create `investor_profiles`.
4. Investor signs in → accepts published terms → data room downloads via 60s signed URLs.
5. Founder revokes → role removed; profile `access_status=revoked`; new URLs fail.

## UI shells

- `InvestorShell` — gated public overview navigation
- `WorkspaceShell` — authenticated nav (investor + founder admin links)
- Metric status pills: Actual / Estimated / Projected / Target / Under development / Planned / Founder-provided / Pending validation

## Design constraints

Light theme only. Warm neutrals + deep Novalyte green / teal. Geist body + Lora headings. No dark mode, no fake logos, no unsupported metrics rendered as facts.
