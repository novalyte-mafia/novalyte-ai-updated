# Clinic Directory Preview Data

## Audit summary (2026-07-23)

Every preview record was reviewed against source-URL and status rules.

| Classification | Count | Notes |
| --- | --- | --- |
| Rich demo profiles | 6 | Explicit fictional UI demos (`preview-demo-*`) |
| Demoted placeholders | 26 | Former “unclaimed” rows used `example.com` sources — **not** valid public listings |
| Confirmed unclaimed | 0 | None until a real public `sourceUrl` + website are attached |
| Claimed / verified | 0 | Never seeded |

After sanitization, `PREVIEW_DIRECTORY_CLINICS` contains **32 demo** profiles. Fictional clinics are never labeled Unclaimed Listing.

## Listing statuses

| Status | Meaning | Badge | Claimable | Verified Only |
| --- | --- | --- | --- | --- |
| `demo` | Fictional preview profile | Demo Profile | No | No |
| `unclaimed` | Confirmed real business with public source | Unclaimed Listing | Yes | No |
| `claimed` | Ownership confirmed; may still be under review | Claimed | No | No |
| `verified` | Novalyte-approved | Verified by Novalyte AI | No | Yes |

## Source requirements (unclaimed)

Unclaimed listings **must** have:

- `listingStatus: "unclaimed"`
- `verificationStatus: "not_verified"`
- `claimStatus: "unclaimed"`
- `dataSource: "public_web"`
- Valid `sourceUrl` (not `example.com` / localhost / `.test`)
- Real public `website`
- `lastReviewedAt`

Without a valid source URL, records are demoted to demo by `sanitizePreviewClinic()`.

## Unsupported-field rules

Do not display as confirmed unless sourced:

- Accepting new patients
- Insurance / HSA-FSA / financing
- Same-day / next appointment
- Consultation fee (except clearly labeled demo pricing on profile detail)
- Provider credentials, outcomes, awards

Card UI omits unknown values instead of repeating “Not publicly listed.”

Display helpers live in `src/lib/directory/validate-clinic.ts`.

## Demo feature flag

```bash
NEXT_PUBLIC_SHOW_DIRECTORY_DEMOS=true
```

| Environment | Default |
| --- | --- |
| Non-production | Demos shown (`true`) |
| Production | Demos hidden unless flag is `true` |

When demos are hidden, they are filtered in `listPublishedClinics()` and are not keyboard-focusable in results.

Users can also toggle **Include Demo Profiles** in directory filters when demos are available.

## Sorting rules

Default sort label: **Relevance** (not Recommended).

Relevance order uses `directorySortRank`: verified → claimed → unclaimed → demo, then profile completeness.

Helper copy: results are ordered by search relevance and available profile information, **not medical quality**.

## Badge rules

- Demo Profile — slate, fictional aria-label, never claimable
- Unclaimed Listing — muted amber, public-source disclaimer on profile
- Claimed — sky (not green-verified)
- Verified by Novalyte AI — teal/green, only after real approval

## Claim & verification eligibility

- Demo → never claimable
- Unclaimed → claim CTA allowed
- Claimed → ownership confirmed; details may still be under review
- Verified → only after Novalyte verification process (do not seed)

## Convert demo → unclaimed

1. Confirm real business identity and public website.
2. Set `sourceUrl`, `website`, `lastReviewedAt`, `dataSource: "public_web"`.
3. Set `listingStatus: "unclaimed"`, `claimStatus: "unclaimed"`, `verificationStatus: "not_verified"`.
4. Null unsupported operational fields until independently confirmed.
5. Re-run `validateDirectoryClinic` / seed script.

## Convert unclaimed → claimed

1. Complete ownership verification via claim flow / org claim API.
2. Set `listingStatus: "claimed"`, `claimStatus: "claimed"`.
3. Do **not** set verified until clinical review completes.

## Approve verified listing

1. Complete Novalyte verification workflow.
2. Set `listingStatus: "verified"`, `verified: true`, `verificationStatus: "approved"` (or `verified`).
3. Publish through `prospect_directory_profiles` gate when applicable.

## How listings load

`listPublishedClinics()`:

1. Loads verified published clinics from Supabase.
2. Soft-loads seeded `demo` / `unclaimed` rows.
3. Merges sanitized preview dataset.
4. Filters demos when `NEXT_PUBLIC_SHOW_DIRECTORY_DEMOS` is false in production.
5. DB claimed/verified rows win over preview seeds with the same slug.

## Seed commands

```bash
supabase db query --linked -f supabase/migrations/20260723120000_clinic_directory_listing_status.sql
npm run db:seed:directory
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Metadata

Directory page title: **Men’s Health Clinic Directory | Novalyte AI**  
Do not use “Verified Directory” in titles, OG, Twitter, or SEO copy.
