# Form, Notification, and Analytics Implementation Report

**Completed:** July 21, 2026  
**Homepage production:** `https://novalyte.io`  
**Admin production:** `https://admin.novalyte.io`

## Original root cause

Notifications were implemented only for isolated routes:

- Contact had its own Slack/email code and delivery table.
- Professional onboarding had Slack only.
- Investor forms had separate best-effort notification code.
- Most forms only inserted a source record and emitted a PostHog event.
- There was no unified outbox, retry worker, or dashboard notification queue.
- Recipient variables differed between `admin@novalyte.io` and `founder@novalyte.io`.

The failure was therefore systemic: successful source-table inserts did not imply a founder notification.

## What changed

### Database

Migration: `supabase/migrations/20260721225409_unified_form_notification_outbox.sql`

Applied to production:

- `form_submissions`
- `form_notification_deliveries`
- unique form/idempotency and source-record constraints
- notification state, attempts, provider result, attribution, read/follow-up state
- RLS enabled
- no anon access
- founder/admin JWT read/update policies
- service-role-only inserts and processing

Supabase advisors reported no finding against the new tables. Existing unrelated project advisor notices remain.

### Shared notification service

`src/lib/form-notifications.ts` now provides:

- database-first operational record
- two-channel outbox
- immediate Slack and Resend attempts
- per-channel result persistence
- bounded retry/backoff
- atomic conditional delivery claim
- duplicate alert prevention
- category-specific Slack/email formatting
- canonical dashboard deep links
- HTML and Slack escaping
- provider-error truncation
- healthcare-safe metadata allowlist
- medical message/answer suppression
- UTM/referrer/source attribution

### Retry processing

- `GET /api/cron/form-notifications`
- Vercel Cron every five minutes
- bearer-secret protection
- failed or unconfigured delivery retries
- manual dashboard retry resets attempts and queues the failed channels

### Form integrations

Unified outbox calls were added to:

- patient assessment
- campaign lead
- clinic application
- clinic quick onboarding
- clinic claim
- directory listing review
- professional onboarding
- job application
- employer onboarding finalization
- employer job posting
- vendor onboarding
- marketplace quote
- consultation request
- contact inquiry
- newsletter signup
- investor access request
- investor meeting request

Existing domain tables remain the source of truth. Existing sender confirmation behavior for contact submissions was preserved.

### Administrator recipient configuration

Canonical production configuration:

- `ADMIN_NOTIFICATION_EMAIL=admin@novalyte.io`
- `ADMIN_NOTIFICATION_BCC_EMAIL=jamil@novalyte.io`
- `NOTIFICATION_FROM_EMAIL=Novalyte AI <notifications@novalyte.io>`
- `ADMIN_DASHBOARD_URL=https://admin.novalyte.io`

Compatibility fallbacks remain for legacy `CONTACT_*`, `INVESTOR_*`, and Slack variables. Recipient addresses are centralized, not repeated across routes.

### Admin dashboard

Added:

- `Forms & Notifications` navigation entry
- real `form_submissions` data source
- search
- form type filter
- date range
- notification status
- source and campaign
- read/unread
- follow-up status
- Slack/email status
- delivery errors
- privacy warning for healthcare records
- read state
- follow-up state
- retry action
- source/submission details

No mock submission rows are used.

## Slack configuration and result

Preferred variable: `SLACK_FORM_WEBHOOK_URL`  
Compatibility fallback: `SLACK_CONTACT_WEBHOOK_URL`, then `SLACK_WEBHOOK_URL`

Production results:

- Ten production-equivalent public tests created Slack deliveries.
- Supabase recorded all ten as `sent`.
- Each delivery was claimed once.
- No tested form route produced a Vercel runtime error.

Slack HTTP/provider acceptance is verified. Human visual confirmation in the Slack client is outside the available tool access.

## Email configuration and result

Provider: Resend  
Key: `RESEND_API_KEY`  
Sender: `NOTIFICATION_FROM_EMAIL`  
To: `ADMIN_NOTIFICATION_EMAIL`  
BCC: `ADMIN_NOTIFICATION_BCC_EMAIL`

Production results:

- Ten production-equivalent public tests created Resend deliveries.
- Supabase recorded all ten as `sent`.
- Provider message IDs were persisted where returned.
- Reply-To uses the submitter email when available.

Resend provider acceptance is verified. Final inbox placement/read receipt cannot be independently observed without mailbox access.

## Analytics changes

### GA4

- GA4 remains consent-gated.
- App Router path changes emit canonical `page_view`.
- safe custom events are sent through both `dataLayer` and `gtag`.
- initial/return UTM attribution persists for later conversion events.
- no PII or health-answer properties are allowed.
- dashboard GA4 panel is explicitly separate from PostHog.
- no PostHog number is relabeled as GA4.
- when Data API credentials are absent, the dashboard shows configuration state and a property link instead of fabricated metrics.

GA4 events implemented or retained:

- `page_view`
- `clinic_search`
- `clinic_profile_viewed`
- `assessment_started`
- `assessment_step_completed`
- `assessment_submitted` / `assessment_completed`
- `clinic_application_started`
- `clinic_application_submitted`
- `contact_form_started`
- `contact_form_submitted`
- `job_application_started`
- `job_application_submitted`
- professional/employer registration and completion events
- `marketplace_product_viewed`
- `marketplace_checkout_started`
- `article_viewed`
- `investor_page_viewed`
- `investor_contact_started`
- `investor_contact_submitted`
- `booking_link_clicked`
- `primary_cta_clicked`
- `form_validation_error`
- `form_submission_error`

### PostHog

- consent-gated initialization
- page and history tracking
- safe custom event parity with GA4
- UTM persistence
- JavaScript error capture
- anonymous/identified separation
- all inputs masked
- all replay text masked
- session recording stopped on clinic, workforce, investor admin, data-room, financial, workspace, update, and traction surfaces
- production dashboard queries include `novalyte.io`, `www`, `ads`, `investor`, and `portal` hosts
- assessment completion query recognizes client and server completion names

## Privacy protections

- Patient assessment, campaign patient lead, and consultation notifications never include medical answers or free-text health details.
- Production privacy query confirmed `safe_message` was suppressed for all three healthcare test categories.
- Health-safe metadata contained only routing/source/consent context.
- GA4/PostHog property sanitization excludes names, emails, phones, addresses, messages, assessment answers, symptoms, diagnoses, medication, passwords, and tokens.
- Service-role, Slack, Resend, and cron secrets remain server-side.
- Error logs contain identifiers/status, not raw form or medical contents.

## Production verification

Passed:

- homepage TypeScript
- homepage production build
- dashboard TypeScript
- dashboard production build
- homepage tests: 13/13
- dashboard tests: 56/56
- production Supabase migration
- RLS enabled on both new tables
- production homepage deployment
- production dashboard deployment
- 10 marked `TEST — DO NOT CONTACT` public submissions
- 10/10 durable source records
- 10/10 unified admin records
- 10/10 Slack provider acceptance
- 10/10 Resend provider acceptance
- 10/10 privacy-safe outbox checks
- 0 Vercel runtime errors across tested routes
- LinkedIn UTM source/campaign persisted on the contact test

Not executed end-to-end because they require an authenticated user/org/investor session:

- professional onboarding
- job application
- employer onboarding
- job posting
- clinic claim
- directory listing review
- investor meeting request

Their server integrations type-check and deploy, but are not marked production E2E-passed.

Not independently observed:

- final email inbox placement/read receipt
- visual Slack-client arrival
- GA4 DebugView
- PostHog event explorer/replay UI
- authenticated dashboard browser flow
- mobile browser form submission

## Environment variables

Homepage:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`
- `ADMIN_NOTIFICATION_BCC_EMAIL`
- `NOTIFICATION_FROM_EMAIL`
- `SLACK_FORM_WEBHOOK_URL` or supported fallback
- `ADMIN_DASHBOARD_URL`
- `CRON_SECRET`
- `FORM_NOTIFICATION_CRON_SECRET`
- PostHog public variables
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- optional `NEXT_PUBLIC_GTM_CONTAINER_ID`

Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NOVALYTE_ADMIN_EMAIL`
- existing admin authentication variables
- PostHog reporting variables
- optional `GA4_PROPERTY_ID`
- optional `GA4_PROPERTY_URL`
- optional read-only `GOOGLE_SERVICE_ACCOUNT_JSON`

## Files changed for this implementation

Homepage:

- `.env.example`
- `FORM-NOTIFICATION-ANALYTICS-AUDIT.md`
- `FORM-NOTIFICATION-ANALYTICS-REPORT.md`
- `FORM-TEST-MATRIX.md`
- `vercel.json`
- `supabase/migrations/20260721225409_unified_form_notification_outbox.sql`
- `src/lib/form-notifications.ts`
- `src/lib/analytics-client.ts`
- `src/lib/posthog-server.ts`
- `src/components/site/analytics-manager.tsx`
- public form API routes listed above
- form/analytics client components listed in this report

Dashboard:

- `.env.example`
- `src/app/api/form-submissions/route.ts`
- `src/app/api/analytics/ga4/route.ts`
- `src/app/api/analytics/traffic/route.ts`
- `src/app/api/analytics/live/route.ts`
- `src/components/admin/views/form-submissions.tsx`
- `src/components/admin/views/traffic-analytics.tsx`
- admin app/sidebar registration

## Deployment / rollback

Deployment has already been completed to both production Vercel projects and the shared production Supabase project.

For future deployment:

1. Apply the migration.
2. configure all required environment variables;
3. deploy the homepage;
4. deploy the dashboard;
5. submit marked tests;
6. verify source row, `form_submissions`, both delivery rows, and dashboard visibility;
7. verify GA4 DebugView and PostHog Live Events with analytics consent granted.

The system is production-ready for the ten tested public flows. Full-system sign-off still requires authenticated-flow, mobile-browser, GA4 UI, PostHog UI, Slack-client, and inbox-observation checks listed above.
