# Clinic Portal Ops Runbook

## Claim → publish → admin assign → clinic sees lead

1. **Clinic onboarding** — User signs in at `portal.novalyte.io`, creates org (or accepts invite), claims clinic via `/clinic/onboarding`.
2. **Admin approve claim** — In Admin Command Center, approve `clinic_claims`. Ensures `"Clinic".organization_id` is set.
3. **Directory submit** — Clinic submits listing from `/clinic/directory` → `prospect_directory_profiles` review queue.
4. **Admin publish** — Approve directory publication (public listing gate). Clinics never self-publish.
5. **Admin push lead** — Patient Leads → Assign to claimed clinic (`POST /api/patient-leads/[id]/assign`). Requires `organization_id` on Clinic.
6. **Clinic inbox** — Portal `/clinic/leads` lists `lead_assignments` for that org’s clinics. Unread = `delivered` / `pending`.
7. **Notify** — Assign creates `portal_notifications` for org members and emails when `RESEND_API_KEY` is set.

## Tenant isolation smoke

- Sign in as Clinic A → note assignment IDs.
- Sign in as Clinic B → `GET /api/clinic/leads` must not return Clinic A rows.
- `GET /api/clinic/leads/{foreignAssignmentId}` must return **404**, never 200.
- Unit tests: `src/lib/clinic/__tests__/capabilities.test.ts`.

## Admin “view as clinic”

- **Gate only** until product enables it: `POST /api/clinics/[id]/view-as` in Admin HQ creates an audited row in `clinic_admin_impersonation_sessions` and returns a design-only payload (`enabled: false` until session minting ships).
- Never mint clinic JWTs without audit + reason.
- Prospect CRM / call recordings must never appear in portal responses.

## Capability flags

`organization_memberships.portal_capabilities` examples:

```json
{ "marketplace": false, "leads_readonly": true, "billing": true }
```

Empty `{}` → role defaults (owner/admin full; viewer read-heavy; recruiter no team/billing).
