# Analytics Events

Privacy rules:

- Events fire only after analytics cookie consent
- Properties pass through `sanitizeAnalyticsProperties` (blocks answer/medical/password/token/email/phone/name-like keys)
- No assessment answers, form bodies, or health details in properties
- Prefer IDs/slugs/counts/booleans over free-text

Sources:

- **Client**: PostHog + GTM `dataLayer` via `captureSafeEvent` / `captureAnalyticsEvent`
- **Admin reporting**: PostHog HogQL (`/api/analytics/traffic`, `/api/analytics/live`) when server credentials configured

## General

| Event | Trigger | Properties | Where viewed | How to test |
|-------|---------|------------|--------------|-------------|
| `page_view` | Page load after consent | `path`, `page_title`, `referrer_domain`, `device_type`, UTMs | PostHog / GTM / Traffic Analytics | Load any public page with consent |
| `session_started` | First page in session | `landing_path`, `referrer_domain`, `device_type` | PostHog | New browser session |
| `scroll_depth_reached` | 25/50/75/90% scroll | `path`, `percent` | PostHog | Scroll a long page |
| `navigation_item_clicked` | Shell nav custom event | `destination_view` | PostHog | Click main nav |
| `outbound_link_clicked` | External link click | `path`, `destination_host`, `link_label` | PostHog | Click external link |
| `javascript_error` | window error / rejection | `path`, `error_name` | PostHog | Force a client error |
| `404_page_viewed` | Custom 404 mount | path via manager context | PostHog | Visit unknown URL |
| `form_error` | Validation/submit failure | `form_type`, optional `stage_number` | PostHog | Fail a form validation |

CTA clicks also use `data-analytics-event` attributes; manager captures those with `path` + `cta_label`.

## Journal

| Event | Trigger | Properties |
|-------|---------|------------|
| `article_viewed` | Article mount | `article_slug`, `category`, `reading_time_minutes` |
| `article_50_percent_read` | Scroll ?50% | `article_slug`, `category` |
| `article_90_percent_read` | Scroll ?90% | `article_slug`, `category` |
| `related_article_clicked` | Related link | label via attribute |
| `journal_directory_cta_clicked` | Directory CTA | label via attribute |
| `journal_assessment_cta_clicked` | Assessment CTA | label via attribute |
| `external_medical_source_clicked` | Reference URL click | label via attribute |
| `video_played` | Video play button | `article_path`, `video_host` |

## Directory

| Event | Trigger | Properties |
|-------|---------|------------|
| `directory_search_started` | First care/location input | none |
| `directory_search_submitted` | Search Clinics button | `has_care_query`, `has_location_query`, `result_count` |
| `directory_filter_applied` | Filter change | `active_filter_count` |
| `directory_location_requested` | Use My Location | none |
| `directory_location_permission_granted` | Geolocation success | none |
| `directory_location_permission_denied` | Deny/unsupported | `reason` |
| `directory_no_results` | Empty result after debounce | query flags |
| `clinic_profile_viewed` | Profile page | `clinic_id`, `clinic_slug`, `state`, `city` |
| `clinic_phone_clicked` | tel: link | slug via label |
| `clinic_website_clicked` | website link | slug via label |
| `booking_link_clicked` | booking URL | slug via label |
| `clinic_saved` | Save clinic | `clinic_slug` |
| `directory_listing_interest_clicked` | Apply to list CTA | none |

## Patient

| Event | Trigger | Properties |
|-------|---------|------------|
| `assessment_started` | Assessment begin | non-sensitive step metadata only |
| `assessment_step_completed` | Step advance | step index (no answers) |
| `assessment_abandoned` | Unmount before complete | step index |
| `assessment_completed` | Finish | non-sensitive counts only |
| `clinic_recommendation_viewed` | Results | non-sensitive |
| `directory_handoff_clicked` | Go to directory | none |

## Clinic application

| Event | Trigger | Properties |
|-------|---------|------------|
| `clinic_application_started` | Form mount | none |
| `clinic_application_step_completed` | Stage advance | `stage_number` |
| `clinic_application_abandoned` | Unmount before submit | `stage_number` |
| `clinic_application_submitted` | Successful POST | none |

## Workforce

| Event | Trigger | Properties |
|-------|---------|------------|
| `professional_registration_started` | Sign-up page | none |
| `professional_account_created` | Auth signup success | `confirmation_required` |
| `professional_profile_started` | Onboarding first open | none |
| `professional_onboarding_step_completed` | Step save | `step`, `step_name` |
| `professional_profile_completed` | Profile publish | none |
| `employer_registration_started` | Employer onboarding | none |
| `employer_registration_step_completed` | Step advance | `stage_number` |
| `employer_account_created` | Auth signup pending confirm | `confirmation_required` |
| `employer_profile_completed` | Org finalize | none |
| `job_viewed` | Job detail | `job_id` |
| `job_application_started` | Apply scroll/tab | `job_id` |
| `job_application_submitted` | Apply success | `job_id` |

## Campaign landing pages

| Event | Trigger | Properties |
|-------|---------|------------|
| `campaign_assessment_viewed` | Embedded assessment mount | `page_id`, `campaign_id`, `assessment_type`, `host` |
| `campaign_assessment_started` | Begin assessment on LP | same (no answers) |
| `campaign_assessment_completed` | Successful POST from LP | same (no answers) |
| `campaign_assessment_completed` (server) | `/api/assessment` campaign submit | `page_id`, `campaign_id`, `assessment_type`, `host`, `source_page` |

Client events fire via `captureSafeEvent` in `EmbeddedAssessment` / `AssessmentExperience` when `attribution.csPageId` is set. Never include assessment answers or contact fields.

## Admin interfaces

| View | Source | Notes |
|------|--------|-------|
| Traffic Analytics | PostHog HogQL | Production host filter; blank if unconfigured |
| Live Website Activity | PostHog Events API | Privacy-safe metadata only |
| Content Performance | PostHog HogQL | No mock bounce/conversion numbers |

## Testing checklist

1. Accept analytics cookies on `novalyte.io`
2. Open PostHog Live events (or browser Network ? `/ingest`)
3. Walk: homepage ? journal article scroll ? directory search ? clinic profile phone/website ? assessment start/abandon ? clinic apply step ? workforce signup
4. Confirm no event properties contain emails, phone numbers, or assessment answers
5. In dashboard Traffic Analytics, select Last 7 days and confirm production-only rows after credentials are set
