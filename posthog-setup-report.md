# Novalyte analytics setup

## Configuration

- PostHog project: `514503`
- PostHog region: US
- Browser ingestion: `/ingest` reverse proxy
- Google Analytics measurement ID: configured through `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Environments configured in Vercel: Production, Preview, Development
- Consent behavior: PostHog, Google Analytics, and Vercel Analytics load only after analytics consent

## Product events

| Event | Trigger | Key properties |
| --- | --- | --- |
| `analytics_consent_granted` | Analytics consent changes from off to on | None |
| `site_view_changed` | A visitor changes a public-site view through the shared navigation helper | `view` |
| `professional_profile_cta_clicked` | A professional registration CTA is selected | `source` |
| `professional_account_created` | Supabase creates a professional Auth account | `confirmation_required` |
| `professional_email_confirmed` | Supabase confirms the professional email | `confirmation_type` |
| `professional_signed_in` | A professional signs in successfully | None |
| `professional_onboarding_opened` | A verified professional starts or resumes onboarding | `mode`, `step` |
| `professional_onboarding_step_completed` | A professional saves an onboarding step | `step`, `step_name` |
| `professional_onboarding_completed` | The server completes the professional profile submission | `review_status`, profile completion counts |

Authenticated activity is identified with the canonical Supabase Auth user ID. Email and role are attached only to the PostHog person profile, not duplicated on every event.

## Verification

- Production build: passed
- Focused ESLint checks: passed
- Browser with no stored consent: zero PostHog or Google Analytics network requests
- Browser after Accept All: PostHog reverse-proxy requests and Google `page_view` request observed
- Browser console: zero errors during consent tests
- Full repository typecheck: currently blocked by unrelated existing errors in example websocket files and several pre-existing site components

## PostHog workspace follow-up

The PostHog wizard installed its MCP analytics and Next.js integration skills locally. The hosted wizard agent was unavailable during setup, and the current Codex session does not expose a PostHog MCP connection, so dashboards and insights were not created automatically. The event taxonomy above is ready for those views once events reach the project.
