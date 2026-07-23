# Clinic Directory Preview Data

## Audit summary (2026-07-23)

Preview listings are fictional sample clinics used to demonstrate the directory while founding clinics complete verification.

| Classification | Count | Notes |
| --- | --- | --- |
| Preview / demo profiles | 16 | Explicit fictional UI previews (`preview-01` … `preview-16`) |
| Confirmed unclaimed | 0 | None until a real public `sourceUrl` + website are attached |
| Claimed / verified | 0 | Never seeded |

`PREVIEW_DIRECTORY_CLINICS` contains **16 preview** profiles. Fictional clinics are never labeled Unclaimed Listing and never pass Verified Only.

## Markets covered

San Francisco (2), Redwood City, Palo Alto, Los Angeles (2), Phoenix, Scottsdale, Denver, Austin, Dallas, Portland, New York, Miami, Honolulu, Chicago.

## Listing statuses

| Status | Meaning | Badge | Claimable | Verified Only |
| --- | --- | --- | --- | --- |
| `demo` | Fictional preview profile | Preview Profile | No | No |
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

Do not display as confirmed on cards unless sourced:

- Accepting new patients
- Insurance / HSA-FSA / financing
- Same-day / next appointment
- Consultation fee (except clearly labeled preview pricing on profile detail)
- Provider credentials, outcomes, awards
- Fake patient reviews / ratings

Card UI omits unknown values instead of repeating “Not publicly listed.”

Display helpers live in `src/lib/directory/validate-clinic.ts`.

## Preview feature flag

```bash
NEXT_PUBLIC_SHOW_DIRECTORY_DEMOS=true
```

| Environment | Default |
| --- | --- |
| Any (unset) | Preview profiles shown (`true`) |
| Explicit `false` | Preview profiles hidden |

When previews are hidden, they are filtered in `listPublishedClinics()` and are not keyboard-focusable in results.

Users can also toggle **Include Preview Profiles** in directory filters when demos are available.

## Sorting rules

Default sort label: **Relevance** (not Recommended).

Relevance order uses `directorySortRank`: verified → claimed → unclaimed → demo, then profile completeness.

Helper copy: results are ordered by search relevance and available profile information, **not medical quality**.

## Badge rules

- Preview Profile — slate, fictional aria-label, never claimable
- Unclaimed Listing — muted amber, public-source disclaimer on profile
- Claimed — sky (not green-verified)
- Verified by Novalyte AI — teal/green, only after real approval

## Claim & verification eligibility

- Demo / preview → never claimable; booking disabled
- Unclaimed → claim CTA allowed
- Claimed → ownership confirmed; details may still be under review
- Verified → only after Novalyte verification process (do not seed)

## Seed / cleanup

```bash
npx tsx --env-file=.env.local scripts/seed-directory-preview.ts
```

Upserts by stable preview id / slug. Skips claimed or verified DB rows. Safe to re-run.

To remove preview listings later, delete rows where `listingStatus = 'demo'` and `id` like `preview-%`, or remove from `src/lib/directory/preview-clinics.ts` and redeploy (in-memory merge path).

## Convert demo → unclaimed

1. Confirm real business identity and public website.
2. Set `sourceUrl`, `website`, `lastReviewedAt`, `dataSource: "public_web"`.
3. Set `listingStatus: "unclaimed"`, `claimStatus: "unclaimed"`, `verificationStatus: "not_verified"`.
4. Null unsupported operational fields until independently confirmed.
5. Re-run `validateDirectoryClinic` / seed script.

## Convert unclaimed → claimed

1. Complete ownership verification via claim flow / org claim API.
