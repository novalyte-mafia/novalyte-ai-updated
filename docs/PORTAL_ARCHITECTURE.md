# Clinic Portal Architecture (`portal.novalyte.io`)

## Decision (locked)

- **Same Next.js app** as the public site (`novalyte-ai-updated` / `z.ai-novalyte-new-homepage`).
- Host middleware in `src/middleware.ts` rewrites `portal.novalyte.io` (and `portal.localhost`) to `/clinic/*`.
- **Admin command center stays separate** (`novalyte-dashboard` / `the-dashboard`). Never point portal at admin.

```
novalyte.io (public) ──apply/claim/assess──► Supabase
portal.novalyte.io (/clinic) ──org RLS + Bearer APIs──► Supabase
admin dashboard ──approve claims / push leads──► Supabase
```

## Route map

| Path | Purpose |
|------|---------|
| `/` → `/clinic` | Gateway |
| `/clinic/sign-in`, `/forgot-password`, `/reset-password` | Auth |
| `/clinic/onboarding` | Org create + claim |
| `/clinic/dashboard` | Home KPIs, activity, quick actions |
| `/clinic/profile` | Operational profile editor |
| `/clinic/directory` | Listing status, preview, submit-for-review |
| `/clinic/leads`, `/clinic/leads/[id]` | Lead pipeline + notes/tasks |
| `/clinic/patients` | Patient Center (assessment summaries) |
| `/clinic/calendar` | Appointments + follow-ups |
| `/clinic/workforce` | Jobs + applicants |
| `/clinic/marketplace` | Embedded catalog + quote requests |
| `/clinic/analytics` | Real lead metrics + CSV export |
| `/clinic/team` | Invites + roles |
| `/clinic/messages` | Notifications (+ messaging architecture) |
| `/clinic/billing` | Plan shell + Stripe-ready subscriptions |
| `/clinic/settings` | Account, password, prefs |

## Auth & tenant isolation

1. Browser session via Supabase Auth (`getSupabaseClient`).
2. Portal APIs: `Authorization: Bearer` + `requireVerifiedUser` + org membership check **before** service-role queries.
3. Every clinic-owned row keyed by `organization_id` and/or `clinic_id`.
4. Never expose: prospect notes, calls, recordings, internal scores, admin audit.

Roles map to `organization_memberships.role` (`owner` | `admin` | `recruiter` | `viewer`) plus optional `portal_capabilities` jsonb.
Middleware enforces a Supabase session on `/clinic/*` (except sign-in / password pages); APIs remain Bearer + membership scoped.

See also `docs/CLINIC_PORTAL_OPS.md` for claim → assign runbook and admin view-as gate.

## Key tables

- `employer_organizations`, `organization_memberships` (+ `portal_capabilities`)
- `Clinic`, `ClinicLocation`, `ClinicProvider`, `ClinicTreatment`
- `clinic_claims` (admin approves; clinics never self-publish)
- `patient_leads`, `lead_assignments`, `lead_events`
- `portal_invitations`, `portal_notifications`
- `prospect_directory_profiles` (publication gate for public directory)

## Admin glue

- Create/list leads: `GET|POST /api/patient-leads` (dashboard)
- Assign to clinic: `POST /api/patient-leads/[id]/assign`
- Promote assessment → lead: `promote_assessment_to_patient_lead(assessment_id)` (service-role)

## Non-goals (this pass)

- HIPAA attestation
- Live Stripe / paid plan conversion from listing
- Separate portal repository
- Fake production metrics
- Exposing admin prospecting/call data to clinics

## Local / deploy notes

- Portal host must be on the same Vercel project as `novalyte.io`.
- Middleware **redirects** (not rewrites) bare portal paths to `/clinic/*` so the App Router client pathname matches a real clinic page. Rewrites left the URL as `/` and hydrated the public marketing homepage.
- Supabase Auth redirect allowlist (via `supabase/config.toml` + `supabase config push`):
  - `https://portal.novalyte.io/**`
  - `https://portal.novalyte.io/auth/callback`
- Password reset from portal uses `/auth/callback?next=/clinic/reset-password`.

## Handoff checklist

See also `HANDOFF.md` for ops runbooks. Portal-specific:

- [ ] `portal.novalyte.io` DNS + SSL on Vercel project
- [ ] Migrations applied (`portal_invitations`, `portal_notifications`, capabilities, lead status expand)
- [ ] Tenant isolation smoke: clinic A cannot read clinic B assignments
- [ ] Clinic can sign out from WorkspaceShell
- [ ] Profile save upserts locations/providers/treatments
- [ ] Admin Patient Leads uses live APIs (not mocks)
