# Form, Notification, and Analytics Audit

**Audit date:** July 21, 2026  
**Repositories:** `z.ai-novalyte-new-homepage`, `the-dashboard`  
**Production systems checked:** Vercel project configuration, Supabase production tables/API logs, live source paths

## Executive finding

The primary failure is architectural fragmentation, not one broken form:

1. Only the generic contact route attempts both Slack and administrator email.
2. Most other forms persist data and emit PostHog events but send no founder notification.
3. Specialized flows use different webhook variables and delivery tables.
4. Production has `SLACK_WEBHOOK_URL` and `RESEND_API_KEY`, but does not have the proposed canonical `ADMIN_NOTIFICATION_EMAIL`, `ADMIN_NOTIFICATION_BCC_EMAIL`, `NOTIFICATION_FROM_EMAIL`, or `SLACK_FORM_WEBHOOK_URL`.
5. Contact falls back to `admin@novalyte.io`; investor routes fall back to `founder@novalyte.io`; dashboard login uses `NOVALYTE_ADMIN_EMAIL`. Recipient behavior is inconsistent.
6. Failed delivery rows exist only for contact/professional/investor flows and there is no shared retry worker or centralized dashboard.
7. Existing admin screens expose only selected source tables. Several public records (contact, newsletter, quote, consultation, vendor/clinic onboarding, investor requests) are absent from the main dashboard.

## Production configuration audit

### Homepage Vercel project

Present: Supabase URL/anon/service-role, `RESEND_API_KEY`, `SLACK_WEBHOOK_URL`, GA4 measurement ID, PostHog client variables.

Missing canonical variables:

- `ADMIN_NOTIFICATION_EMAIL`
- `ADMIN_NOTIFICATION_BCC_EMAIL`
- `NOTIFICATION_FROM_EMAIL`
- `SLACK_FORM_WEBHOOK_URL`
- `ADMIN_DASHBOARD_URL`
- `FORM_NOTIFICATION_CRON_SECRET`

### Dashboard Vercel project

Present: Supabase URL/service-role, `NOVALYTE_ADMIN_EMAIL`, PostHog reporting credentials, application URL, cron secret.

### Recipient discrepancy

- Generic contact route: `CONTACT_NOTIFICATION_TO_EMAIL || admin@novalyte.io`
- Investor routes: `INVESTOR_NOTIFY_EMAIL || CONTACT_NOTIFICATION_TO_EMAIL || founder@novalyte.io`
- Dashboard login identity: `NOVALYTE_ADMIN_EMAIL`
- Founder configuration/docs: `founder@novalyte.io`
- Requested operational recipient: `admin@novalyte.io`, BCC `jamil@novalyte.io`

Implementation decision: one canonical `ADMIN_NOTIFICATION_EMAIL` with optional `ADMIN_NOTIFICATION_BCC_EMAIL`; compatibility fallbacks remain during rollout. Recipient addresses are not repeated in route code.

## Form inventory

| Form | Public URL / surface | Component | Endpoint | Durable table | Email | Slack | Analytics | Admin visibility | Current problem / required fix |
|---|---|---|---|---|---|---|---|---|---|
| Patient assessment (general) | `/patients` and embedded assessment surfaces | `patient-assessment.tsx`, `assessment-engine.tsx`, `assessment-experience.tsx` | `/api/assessment` | `AssessmentSubmission`; campaign consent may promote to `patient_leads` | Missing | Missing | PostHog server completion; client funnel events | Partial: assessments view derives from patient leads, not all submissions | Store unified envelope; privacy-minimal alert; dashboard link; idempotency |
| Campaign lead / short form | `ads.novalyte.io` pages | campaign components | `/api/campaign-leads` | `patient_leads` | Missing | Missing | Incomplete | Patient Leads only | Add attribution envelope, privacy-minimal notification, analytics |
| Clinic directory application | `/clinics/apply` / clinic application view | `clinic-application.tsx` | `/api/clinic-application` | `ClinicApplication` | Missing | Missing | PostHog server completion | Not reliably represented in main onboarding view | Unified notification + submissions center |
| Clinic quick onboarding | Get-started dialog | `get-started-dialog.tsx` | `/api/clinic-onboarding` | `ClinicOnboarding` | Missing | Missing | PostHog server completion | Missing | Unified notification + dashboard |
| Authenticated clinic claim/listing | `/clinic/onboarding`, profile claim | clinic onboarding/profile components | `/api/clinics/[id]/claim`, `/api/clinic/directory/submit` | `clinic_claims`, directory profile tables | Missing | Missing | Partial | Clinic Claims / Directory | Unified envelope + notifications for submitted claims |
| Professional onboarding | Workforce onboarding | `professional-onboarding.tsx` | `/api/professional-onboarding` | workforce application/profile child tables | Missing administrator email | Existing Slack-only helper | PostHog server completion | Professionals | Replace Slack-only helper with shared outbox; keep domain event |
| Job application | Job detail | `job-detail-view.tsx` | `/api/job-application` | `JobApplication` | Missing | Missing | PostHog server completion | Applications view | Unified notification + idempotency |
| Employer onboarding | Workforce employer onboarding | `employer-onboarding.tsx` | `/api/workforce/employer/onboarding` | `employer_organizations`, memberships, draft | Missing | Missing | Missing completion event | Workforce org views only | Notify on finalize, add completion event |
| Employer job posting | Employer/clinic workforce | employer dashboard / clinic workforce | `/api/workforce/employer/jobs` | `JobPosting` | Missing | Missing | Missing/partial | Jobs | Notify only on new submitted posting |
| Vendor onboarding | Get-started dialog | `get-started-dialog.tsx` | `/api/vendor-onboarding` | `VendorOnboarding` | Missing | Missing | PostHog server completion | Vendor view derives vendors from products and contains synthesized contact values | Unified notification; real submissions center |
| Marketplace quote request | Marketplace/product/vendor pages | product/vendor/marketplace views | `/api/quote` | `QuoteRequest` | Missing | Missing | PostHog server completion | Missing | Unified notification + dashboard |
| Consultation request | Clinic/provider profile | provider/clinic profile views | `/api/consultation` | `ConsultationRequest` | Missing | Missing | PostHog server completion | Missing | Healthcare privacy-minimal notification |
| General contact / partnership | `/contact`, vendor profile inquiry | contact page/vendor profile | `/api/contact` | `contact_submissions`, `contact_notification_deliveries` | Implemented with fallback recipient | Implemented | PostHog server | Missing from main dashboard | Consolidate; sanitize HTML; real retry; idempotency; source/UTM expansion |
| Newsletter signup | Site shells, About, Contact, Journal, campaign footer | multiple | `/api/newsletter` | `NewsletterSignup` (email upsert) | Missing | Missing | PostHog server | Missing | Unified envelope; notify once, not on duplicate upsert |
| Investor access request | `investor.novalyte.io/contact` | `investor/access-request-form.tsx` | `/api/investor/access-request` | `investor_access_requests`, investor delivery table | Email best-effort only if key; route-specific recipient | Route-specific webhook only | Investor audit event, not standard form event | Investor admin only | Shared outbox; UTM/source; Slack delivery result tracking |
| Investor meeting request | Investor `/meet` | `meeting-request-form.tsx` | `/api/investor/meeting` | `investor_meeting_requests` | Email best-effort | Missing | Investor audit event | Investor admin/activity only | Shared outbox + Slack + standard conversion |

## Persistence gaps

- Source tables use mixed naming/types and do not share notification state.
- Most endpoints have no idempotency key.
- Contact generates a reference containing a hard-coded date prefix.
- Contact delivery rows are inserted one by one and are not atomically claimed for retries.
- Notification failure does not lose contact data, but no automated retry exists.
- Other routes have no durable notification attempt record at all.
- Attribution fields are inconsistent; only contact and assessment capture subsets.

## Notification gaps

- There is no shared notification service or category-safe template policy.
- Patient medical fields could be accidentally included if generic payloads are reused; a strict safe-field projection is required.
- Contact HTML interpolates unsanitized user text.
- Slack payloads lack canonical dashboard deep links.
- Investor Slack result is not recorded.
- Professional notification supports Slack only.
- Missing environment variables are recorded inconsistently and are not visible centrally.

## Analytics audit

### GA4 / GTM

- Production has a GA4 measurement ID.
- `AnalyticsManager` loads GA4 only after analytics consent and pushes safe events through `dataLayer`.
- Route changes emit `page_viewed` to dataLayer/PostHog, while explicit `gtag` page views are limited to a custom navigation event. Canonical GA4 `page_view` on App Router path changes is incomplete.
- A GTM container variable is supported but is not present in the production Vercel variable list.
- No GA4 Data API credentials exist in the dashboard; GA4 metrics must not be fabricated. A clearly labeled GA4 link/configuration state is required until API credentials are added.

### PostHog

- Client initialization is consent-gated.
- Session replay masks all input and all text, which is appropriately conservative for healthcare.
- Event property sanitizer drops keys that look like names, email, phone, messages, answers, symptoms, diagnosis, medication, addresses, secrets, and tokens.
- Server-side events use record IDs as distinct IDs and contain operational metadata only.
- Event naming is inconsistent (`page_viewed` vs `$pageview`, `assessment_submitted` vs `assessment_completed`), causing existing dashboard queries to undercount.
- Investor host traffic is excluded by the dashboard production filter, which only recognizes `novalyte.io`.

## Admin dashboard gaps

- No centralized real-submission view.
- Existing vendor screen synthesizes contact addresses from vendor names and is not a source-of-truth submission queue.
- Assessment view uses promoted patient leads, so non-promoted/incomplete assessment submissions are invisible.
- Existing Alerts use a separate notification model and do not show Slack/email delivery state.
- Traffic analytics is PostHog-only despite a generic “Traffic Analytics” label.
- No separate GA4 / PostHog tabs, form delivery filters, or retry action.

## Security findings

- Service-role and webhook secrets are server-side.
- RLS is enabled on current production tables.
- Public endpoints use Zod but rate limiting is inconsistent.
- Contact IP fallback stores the raw IP if HMAC construction fails; this must fail closed to a non-reversible placeholder instead.
- Contact and investor notification error bodies can contain provider output; central storage must truncate/sanitize errors.
- Admin APIs must continue to require the existing founder/admin session.

## Implementation plan

1. Add `form_submissions` and `form_notification_deliveries` with RLS, uniqueness/idempotency constraints, explicit notification states, retry metadata, source attribution, and admin follow-up fields.
2. Add one server-only notification service that:
   - stores/links a safe envelope first;
   - creates Slack/email delivery jobs;
   - atomically claims each job;
   - renders category-specific privacy-safe templates;
   - records provider result/failure;
   - retries with bounded exponential backoff;
   - prevents duplicate sends.
3. Integrate all listed submission endpoints while preserving each existing source table.
4. Add a protected cron processor and manual retry path.
5. Add a real admin submissions center with required filters and statuses.
6. Standardize GA4/PostHog event taxonomy and UTM persistence without PII/health answers.
7. Split dashboard analytics into Overview, Google Analytics, PostHog, Live Activity, Conversions, Forms, Traffic Sources, and Replays. Show GA4 configuration/link until Data API access exists.
8. Run migrations/advisors/tests/builds and execute clearly marked production tests only after deployment and environment configuration.
