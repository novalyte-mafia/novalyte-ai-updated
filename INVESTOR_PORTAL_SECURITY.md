# Investor Portal Security

## Threat model (addressed)

| Threat | Control |
|---|---|
| Uninvited browsing of investor materials | Shared access-code gate (HMAC cookie) + redirect before RSC |
| Guessed access codes | Constant-time compare; IP-hashed rate limit (8 / 10 min) |
| Stolen gate cookie after code rotation | Token embeds code hash; rotation invalidates old cookies |
| Client-forged roles | Roles only in `app_metadata`; grants via security-definer SQL |
| IDOR document download | Server loads document by id, checks approved status + terms, then signs |
| Cross-investor data visibility | RLS + profile ownership filters |
| Service-role key in browser | `server-only` admin module; never exported to client bundles |
| Executable uploads | MIME allowlist + size limit on founder upload API |
| Stale access after revoke | `revoke_account_type` + profile status; subsequent signed-URL mint fails |
| Search-engine indexing | `noindex` metadata, robots disallow, sitemap exclusion |
| CDN caching private HTML | `private, no-cache, no-store` on gate redirect responses |
| PHI / sensitive answers in analytics | Investor portal does not send confidential document content to PostHog/GTM |

## Access-code gate

- Env: `INVESTOR_ACCESS_CODE` (default `1750-44` for invited investors)
- Signing secret: `INVESTOR_GATE_SECRET` (falls back to `CONTACT_RATE_LIMIT_SECRET`, then a local-dev default)
- Cookie: `novalyte_investor_gate` — httpOnly, SameSite=Lax, Secure in production, path `/`, 30-day max-age
- Layout: `src/app/investor/(gated)/layout.tsx` calls `redirect("/investor/gate")` when invalid — **required** so page payloads never stream

## Authentication

- Supabase Auth via `@supabase/ssr` cookie sessions
- Email confirmation required before protected actions
- Founder admin: `founder_admin` (or legacy `admin`) in `account_types`

## Data room

- Private bucket `investor-data-room`
- Founder upload API only
- Download API: `requireApprovedInvestor` → `requireTermsAccepted` → signed URL (~60s)
- Every download logged to `investor_access_events`

## Residual risks (accepted / disclose in handoff)

1. **Shared access code** — anyone with the code sees the gated *overview* (not the data room). Rotate `INVESTOR_ACCESS_CODE` if leaked.
2. **No published access terms yet** — data-room downloads should remain blocked until founder publishes terms; verify before inviting external investors to the workspace.
3. **Attorney-placeholder legal footer** — visible “[ATTORNEY REVIEW REQUIRED]” language should be replaced before wide distribution (content gap, not a security hole).
4. **Automated RLS suite** — policies exist; expand pgTAP/SQL tests beyond unit coverage next.

## Incident response

- Rotate `INVESTOR_ACCESS_CODE` and/or `INVESTOR_GATE_SECRET`
- Revoke investor via admin Investors page (removes role)
- Review `investor_access_events` for anomalous downloads
- Rotate Supabase service-role key only if server compromise is suspected
