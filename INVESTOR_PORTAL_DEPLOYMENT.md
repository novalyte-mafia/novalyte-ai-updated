# Investor Portal Deployment

**Live URL:** https://investor.novalyte.io  
**Verified:** July 21, 2026 — DNS → Vercel, HTTPS, gate redirect, noindex

## Vercel

- Project: marketing homepage (`z.ai-novalyte-new-homepage`)
- Domain attached: `investor.novalyte.io`
- Deploy path: push to `main` (or `vercel --prod` from CI/local with project linked)

## DNS (Hostinger)

| Type | Name | Value | Status |
|---|---|---|---|
| A | `investor` | `76.76.21.21` | Live (manual add; Hostinger API was unreachable at setup time) |

Optional TXT for Vercel domain verification if the dashboard requests it.

## Required environment variables

Set on the Vercel project (Production + Preview as appropriate):

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Auth + data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + SSR anon client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin grants, invites, storage signing |
| `INVESTOR_ACCESS_CODE` | Strongly recommended | Defaults to `1750-44` if unset |
| `INVESTOR_GATE_SECRET` | Strongly recommended | HMAC for gate cookie; do not leave default in prod |
| `NEXT_PUBLIC_INVESTOR_SITE_URL` | Recommended | Canonical `https://investor.novalyte.io` |
| `INVESTOR_NOTIFY_EMAIL` | Recommended | Founder notification recipient |
| `RESEND_API_KEY` | Recommended | Access/meeting email notifications |
| `CONTACT_NOTIFICATION_FROM_EMAIL` | Recommended | From address for Resend |
| `SLACK_INVESTOR_WEBHOOK_URL` or `SLACK_CONTACT_WEBHOOK_URL` | Optional | Slack alerts |
| `CONTACT_RATE_LIMIT_SECRET` | Optional | Shared rate-limit / gate fallback salt |

## Supabase

1. Migration `20260721140000_investor_portal.sql` applied (tables, RLS, bucket).
2. Auth redirect allowlist must include:
   - `https://investor.novalyte.io/**`
   - `https://novalyte.io/**`
   - Local: `http://localhost:3000/**`, `http://investor.localhost:3000/**`
3. Confirm storage bucket `investor-data-room` is **private**.

## Smoke tests after deploy

```bash
# Gate blocks content
curl -sI https://investor.novalyte.io/ | rg -i 'location|HTTP'
# Expect redirect toward /investor/gate

# Leak check — overview copy must NOT appear without cookie
curl -sL https://investor.novalyte.io/ | rg -i 'Explore the platform|Investment thesis' && echo FAIL || echo PASS

# robots
curl -s https://novalyte.io/robots.txt | rg investor
```

## Rollback

- Revert the deploying git commit on `main` and redeploy, or promote previous Vercel deployment.
- To lock the portal immediately: rotate `INVESTOR_ACCESS_CODE` (invalidates cookies) or remove the Vercel domain.

## Local development

```bash
cd z.ai-novalyte-new-homepage
cp .env.example .env.local   # fill Supabase + INVESTOR_* vars
npm install
npm run dev
# Visit http://investor.localhost:3000  (or http://localhost:3000/investor)
# Access code: value of INVESTOR_ACCESS_CODE (default 1750-44)
```

Middleware recognizes `investor.localhost` and `investor.local` as investor hosts.
