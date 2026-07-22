# Form Production Test Matrix

**Test date:** July 21, 2026  
**Test marker:** `TEST — DO NOT CONTACT`

Legend:

- **Pass** — directly verified in production.
- **Code** — implementation, type-check, and deployment verified; authenticated E2E not executed.
- **Not observed** — requires external UI/browser/mailbox access not available in this run.

| Form | URL | Database success | Slack success | Email success | Admin-dashboard success | GA4 success | PostHog success | Mobile success | Privacy validation | Final status |
|---|---|---|---|---|---|---|---|---|---|---|
| Patient assessment | `/patients` → `/api/assessment` | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code; DebugView not observed | Code; provider UI not observed | Not observed | Pass: medical message suppressed | Pass with external analytics/mobile checks pending |
| Campaign patient lead | `ads.novalyte.io` → `/api/campaign-leads` | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass: message suppressed | Pass with external analytics/mobile checks pending |
| Clinic directory application | `/clinics/apply` | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass: no health data | Pass |
| Clinic quick onboarding | Get Started dialog | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass | Pass |
| Clinic claim | `/clinic/onboarding` | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Directory listing review | `/clinic/directory` | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Professional onboarding | `/workforce/professional/onboarding` | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Job application | Workforce job detail | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Employer onboarding | `/workforce/employer/onboarding` | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Employer job posting | Employer/clinic workforce dashboard | Code | Code | Code | Code | Code | Code | Not observed | Code | Authenticated E2E required |
| Vendor onboarding | Get Started dialog | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass | Pass |
| Marketplace quote | Marketplace/product/vendor views | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass | Pass |
| Consultation request | Clinic/provider profile | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass: message/treatment detail suppressed | Pass with external analytics/mobile checks pending |
| Contact/partnership inquiry | `/contact` | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code; LinkedIn UTM persisted | Code; provider UI not observed | Not observed | Pass | Pass |
| Newsletter signup | Site footer/journal/about/contact | Pass | Pass | Pass | Pass: unified record; UI code deployed | Code | Code | Not observed | Pass | Pass |
| Investor access request | `investor.novalyte.io/contact` | Pass | Pass | Pass | Pass: unified record plus investor record | Code | Code | Not observed | Pass | Pass |
| Investor meeting request | `investor.novalyte.io/meet` | Code | Code | Code | Code | Code | Code | Not observed | Code | Approved-investor E2E required |

## Production delivery evidence

The following production-tested form types each had exactly one unified test record and both channels recorded `sent`:

- `patient_assessment`
- `campaign_lead`
- `clinic_application`
- `clinic_onboarding`
- `consultation_request`
- `contact_inquiry`
- `investor_access_request`
- `marketplace_quote`
- `newsletter_signup`
- `vendor_onboarding`

Vercel reported no runtime errors on the tested routes. Supabase confirmed healthcare test envelopes contained no medical free text.

## Remaining manual checks

1. Open Slack and visually confirm the marked test alerts.
2. Confirm the administrator inbox received the messages at `admin@novalyte.io`.
3. Confirm BCC copies at `jamil@novalyte.io`.
4. Sign in to `admin.novalyte.io` and open **Forms & Notifications**.
5. Complete each authenticated flow with a dedicated test account.
6. Run the public flows on iPhone and Android viewports.
7. Verify GA4 DebugView/key events with consent granted.
8. Verify PostHog Live Events, funnel events, and that protected pages have no replay.
