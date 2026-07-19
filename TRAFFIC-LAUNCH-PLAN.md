# Traffic Launch Plan (7 days)

Operational plan for turning Novalyte AI into measurable organic and referral traffic. Do not publish thin filler or unapproved clinic profiles.

## Day 1 ù Deploy and baseline

- [ ] Deploy public site (`z.ai-novalyte-new-homepage`) to production
- [ ] Deploy dashboard (`the-dashboard`) with Traffic Analytics route
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, `/patients`, `/directory`, `/journal` return 200
- [ ] Verify cookie consent ? PostHog/GTM events in browser (Network / PostHog Live)
- [ ] Set dashboard `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID`
- [ ] Open Search Console property and submit sitemap

## Day 2 ù First Journal article

Priority draft: **How to Choose a TRT Clinic** (brief already in SEO Briefs)

- [ ] Create CMS draft from brief
- [ ] Write 2,500ù4,500 words with required sections only; cite Endocrine Society / AUA / FDA
- [ ] Add ?2 linked sources, FAQs, hero image + alt, SEO fields
- [ ] Move to review ? approve ? publish
- [ ] Request indexing for the article URL
- [ ] Share on founder LinkedIn with UTM (`utm_source=linkedin&utm_medium=organic&utm_campaign=journal_trt_clinic`)

## Day 3 ù Clinic outreach pipeline

- [ ] Work Founder-Led Calls queue (permission requests only)
- [ ] For clinics that grant listing permission: mark permission granted on live call record
- [ ] Complete 100% profile completeness + verification before approval
- [ ] Do not publish any clinic without permission + approval

## Day 4 ù Second article + directory CTA loop

Priority draft: **Questions to Ask Before Starting Testosterone Therapy**

- [ ] Publish after human approval
- [ ] Internal-link to Day 2 article and `/directory` + `/patients`
- [ ] Confirm Journal CTAs fire `journal_directory_cta_clicked` / `journal_assessment_cta_clicked`

## Day 5 ù First public clinic profiles (if ready)

- [ ] Approve and publish only clinics that pass the workflow gate
- [ ] Verify public URL `/directory/{state}/{city}/{slug}` in sitemap
- [ ] Spot-check that unpublished prospects return empty / 404 publicly
- [ ] LinkedIn post introducing the directory (no invented clinic claims)

## Day 6 ù Referral and backlinks

- [ ] Ask 3ù5 clinic partners for a reciprocal educational link (Journal, not prospect DB)
- [ ] Reach out to 2 menùs-health educators / operators for citation of Day 2ù4 articles
- [ ] Add UTM-tagged links in email signatures and founder posts
- [ ] Review Search Console Coverage for crawl errors

## Day 7 ù Analytics review and conversion pass

- [ ] Admin ? Traffic Analytics: visitors, landing pages, article views, assessment starts
- [ ] Funnel check: `assessment_started` ? `assessment_completed` ? `directory_handoff_clicked`
- [ ] Funnel check: clinic application and workforce registration starts
- [ ] Fix any broken CTAs / 404s found
- [ ] Queue next briefs: menùs health clinic near you, medical weight-loss clinic, telehealth vs in-person

## Content publishing order (exact)

1. How to Choose a TRT Clinic
2. Questions to Ask Before Starting Testosterone Therapy
3. How to Find a Reputable Menùs Health Clinic Near You
4. What to Look for in a Medical Weight-Loss Clinic
5. Telehealth vs. In-Person Menùs Health Clinics

## Clinic profile publishing rule

Imported ? researching ? contact ? permission requested ? permission granted ? under review ? approved ? published.

Anything before **approved + permission-backed** stays private.
