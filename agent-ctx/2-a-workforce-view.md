# Task 2-a — Workforce Hub view

Agent: Z.ai Code (subagent for Task 2-a)
View file: `src/components/views/workforce-view.tsx`

## What I built

A fully client-side `WorkforceView` component with the exact required signature:

```tsx
export function WorkforceView({ professionals, jobs, onGetStarted }: {
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  onGetStarted: () => void;
})
```

Sections (in order, matching the spec):

1. **Hero** — `<section>` with `bg-gradient-to-b from-teal-50/50 to-background`. Eyebrow pill "Workforce Hub", headline "Specialized Talent for the Future of Men's Health", supporting copy naming all the required roles (Physicians, NPs, PAs, RNs, MAs, Phlebotomists, Medical Directors, Patient Coordinators, Revenue Cycle Specialists). Two CTAs: "Join as a Professional" (onGetStarted) and "Post a Role" (onGetStarted).
2. **Tabs** — `@/components/ui/tabs` with "Browse Professionals" and "Browse Jobs" tabs.
3. **Browse Professionals** — rounded bordered filter card: State select (`US_STATES`), Title select (derived unique titles), Remote toggle (Switch), Verified toggle (Switch). Client-side `useMemo` filtering with "Showing X of Y professionals" count + Reset. Professional cards in responsive grid `md:grid-cols-2 lg:grid-cols-3`. Each card: avatar (initials in colored circle cycling `["teal","emerald","sky","violet","amber"]` — `sky` mapped to `colorClasses("blue")` because the helper exposes sky-tones under the key `blue`), name+title, location with MapPin, Remote pill in sky tone, `VerificationBadge`, licensed states as small badges, specialties as outline badges (max 3), experience/availability/employment-pref row, bio line-clamp-2. Empty state with Users icon, message, "Clear filters" button.
4. **Browse Jobs** — filter card: State select, Employment type select (derived unique types), Remote toggle. Client-side filtering + count + Reset. Job cards grid. Each card: clinic name (uppercase small) + job title (heading), location/employment type/remote status, required licenses as badges, treatment specialties as outline badges, compensation formatted (`$Xk – $Yk` / `From $Xk` / hourly when `< 1000` / null-safe), schedule, description line-clamp-3, two buttons ("View & Apply" primary + "Details" outline) both opening the application dialog. Empty state.
5. **Job application dialog** — `@/components/ui/dialog`. Shows job summary (compensation, schedule, experience, remote, required licenses, treatment specialties, description) + form with Full name (required), Email (required type=email), Phone (optional), Cover note (optional Textarea), consent checkbox (disclosure that Novalyte is a technology platform and clinics are responsible for hiring). Submit → `POST /api/job-application` with `{ jobPostingId, applicantName, applicantEmail, applicantPhone, coverNote }`. Uses `toast` from `sonner` for success/error. Success state shows `CheckCircle2` and a "Close" button. Form state is reset on close via `setTimeout` after the close animation.
6. **Matching logic** — `SectionShell` (tone="muted") with `SectionHeading` eyebrow "How Matching Works". Ten factors (Role, Location, Licensure, Licensed states, Specialty, Remote availability, Experience, Employment preference, Schedule, Credential status) shown as a responsive grid (2/3/5 cols) of small cards, each with an icon + check icon + label.
7. **Disclaimer** — `DisclaimerBanner` tone="amber" with the exact required text about Novalyte facilitating discovery/communication and clinics remaining responsible for background checks, credential verification, etc.
8. **CTA** — `CTASection` with title "Hiring for your men's health clinic?", `onPrimary={onGetStarted}`, `primaryLabel="Post a Role"`, `secondaryLabel="Browse Marketplace"`, `secondaryView="marketplace"`.

## Implementation details / conventions followed

- Used ONLY existing shadcn/ui components: button, input, label, select, switch, badge, card, tabs, dialog, textarea. (Used a native `<input type="checkbox">` for the consent checkbox because the task's allowed-component list did not include `@/components/ui/checkbox` — this matches the pattern used in `directory-view.tsx`.)
- Used shared components: `SectionShell`, `SectionHeading`, `VerificationBadge`, `StatusPill`, `DisclaimerBanner`, `CTASection`. Imported from explicit file paths (e.g. `@/components/shared/cta`) because `src/components/shared/` has no barrel `index.ts`.
- Used helpers from `@/lib/constants`: `splitCsv`, `colorClasses`, `initials`, `US_STATES`.
- Used `cn` from `@/lib/utils`, `toast` from `sonner`, icons from `lucide-react`.
- No `any` types. Form state typed as `ApplicationForm`.
- No indigo/blue as primary — theme is teal/emerald with sky used sparingly (Remote pills, avatar slot 3).
- Fully responsive: filter grids collapse to single column on mobile, cards use `md:grid-cols-2 lg:grid-cols-3`, matching-factors grid is `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.
- No mock/fake metrics — all counts derived from the `professionals`/`jobs` props.

## Compensation formatting helper

```
formatComp(min, max):
  - both present  → "$Xk – $Yk" (or "$X/hr – $Y/hr" when either < 1000)
  - only min      → "From $Xk" (or "From $X/hr")
  - only max      → "Up to $Xk"
  - both null     → null (no compensation block rendered)
```

## Validation

- `bun run lint` — clean (no errors, no warnings).
- Dev server compiles successfully (verified via `dev.log`).

## File path

`/home/z/my-project/src/components/views/workforce-view.tsx`
