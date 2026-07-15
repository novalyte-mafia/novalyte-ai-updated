# Task 20 — Workforce View Rebuild (ecosystem-integrated, healthcare-broad)

Task ID: 20
Agent: Z.ai Code (subagent for Task 20)
Files touched:
- `/home/z/my-project/src/components/views/workforce-view.tsx` (completely rewritten, 2121 lines)

## Signature preserved

```tsx
export function WorkforceView({ professionals, jobs, onGetStarted }: {
  professionals: ProfessionalT[];
  jobs: JobPostingT[];
  onGetStarted: () => void;
})
```

`professionals.length` and `jobs.length` are surfaced as real, prop-derived stats in the hero (no fabricated metrics).

## Sections (in order, matching the spec)

1. **Hero** — `bg-gradient-to-b from-teal-50/60 via-background`. Breadcrumbs (Home → Workforce Hub). Eyebrow pill. Headline "Connect Patient Demand with the **Workforce Required to Deliver Care**" (gradient teal→emerald highlight on the bold phrase). Supporting copy about finding qualified clinical/operational professionals, publishing permanent/flexible roles, expanding as patient volume grows — across clinical, allied health, behavioral health, operations, revenue cycle, technology, specialty care. Three CTAs: **Browse Healthcare Roles** (scrolls to `#browse-jobs`), **Join as a Professional** (`onGetStarted`), **Post a Role** (`onGetStarted`, emerald-tinted). Compact trust row with all 6 required items (Credential-aware profiles · Permanent & flexible · Multi-state licensure · Clinical & operational · Verified organizations · Application tracking). Real prop-derived stat row (Active roles + Professionals in network). SmartImage from `/images/professionals/pro-5.jpg` in a rounded-3xl premium frame with a floating "Credential-aware matching" overlay card.
2. **Ecosystem Connection Section** — `id="ecosystem"` `tone="tint"`. Heading "One Ecosystem Built Around Healthcare Growth". Four connected stages (Patient Demand → Clinic & Provider Growth → Workforce Capacity → Operational Enablement) in a `lg:grid-cols-4` with arrow icons (`ArrowRight`) between cards on desktop, vertical stack on mobile. Each card has icon, title, short description. Bottom teal callout: "More patient demand requires more workforce capacity. Novalyte connects both."
3. **Workforce Models** — Three PremiumCards: Permanent Hiring (BriefcaseBusiness), Contract & Flexible Work (CalendarClock), Capacity Expansion (Rocket). Each with description + CheckItem points list.
4. **Job Search & Filters** — `id="browse-jobs"` `scroll-mt-20`. SectionHeading "Find your next healthcare opportunity". Filter sidebar (sticky `lg:`, left `Sheet` on mobile) with: keyword Input (Search icon), State select (`US_STATES`), Employment type select (derived from jobs), Compensation range select, Remote-only Switch. Sort Select (Most relevant / Newest / Comp high→low / Comp low→high) + ViewToggle (grid/list) on both mobile and desktop rows. Active FilterChip row with "Clear all". Results header "Showing X of Y healthcare opportunities". Premium job cards (PremiumCard + `card-premium-hover`) with: organization name (uppercase muted), Featured amber pill (top 2 of default sort), Verified StatusPill (emerald), SaveButton (`useSaved` store, `toast` on toggle), clickable title → `navigate("job-detail", undefined, { id: job.id })`, location/employment/remote pills, compensation row (Banknote + emerald-bold `formatComp`), specialty tags (teal outline badges), required licenses (muted badges), description (line-clamp-2), schedule, footer with required-experience, Apply now (primary) + View details (outline) buttons. Empty state with Briefcase icon. Pagination (10/page). **Loading uses `useTransition` (`isPending`)** — `applyFilter`, `applySort`, `applyView`, `clearAll` all wrap state updates in `startTransition`. No `useEffect+setState` for loading. While pending, a 6-up `CardSkeleton` grid renders.
5. **Browse by Healthcare Category** — `tone="muted"`. Seven compact category cards: Clinical Care, Allied Health, Behavioral Health, Operations & Administration, Revenue Cycle, Healthcare Technology, Specialty Care. Each with icon + example roles. Clicking a category dispatches a `window` CustomEvent `novalyte:set-job-keyword` (the `JobsSection` listens for it via `useEffect` and calls `applyFilter({ query: keyword })`), then scrolls to `#browse-jobs` and toasts "Filter applied".
6. **Professional Pathway** — Two-column layout. Heading "Build One Professional Profile. Access Multiple Healthcare Opportunities." PremiumCard listing all 10 capabilities as CheckItems in a 2-col grid. CTAs: "Create Your Talent Profile" (`onGetStarted`) + "Browse Healthcare Roles" (scrolls to jobs).
7. **Flexible Talent Pathway** — `tone="tint"`. Heading "Make Your Availability Work for You." Grid of 9 availability options. DisclaimerBanner (muted) using "planned" / "designed to support" language.
8. **Professional Profile Preview** — "Demonstration preview" amber pill. PremiumCard with left column (headshot from `/images/professionals/pro-3.jpg` via SmartImage, name, title, location, profile completion % bar, Resume uploaded + LinkedIn added + Remote-eligible pills) and right column (MetaRow of Experience/Employment pref/Availability, specialties, licensed states, skills, layered verification grid with 6 badges: Email Verified, Phone Verified, Identity Verified, Resume Reviewed, License Verified, Certification Verified). DisclaimerBanner about demonstration data.
9. **Application Tracking Preview** — "Product preview · Demonstration data only" amber pill. PremiumCard with 8-stage application flow (Draft → Submitted → Under Review → Screening → Interview → Offer → Hired → Not Selected) with current stages highlighted. Active applications list (4 mock applications with stage pills). Side column of 4 StatCards (Saved roles, Recommended, Profile views, Employer messages). Demonstration data disclaimer.
10. **Employer Pathway** — Two-column layout. Heading "Build the Capacity Required to Serve More Patients." PremiumCard listing all 10 organization capabilities as CheckItems. CTAs: "Post a Healthcare Role" (emerald, `onGetStarted`) + "Create Organization Account" (`onGetStarted`).
11. **Novalyte Partner Clinic Connection** — `tone="tint"`. Heading "Your Patient Pipeline and Workforce Capacity Should Grow Together." Four benefit cards (Publish from clinic dashboard, Review structured applicants, Talent recommendations, Staffing-pressure insights). DisclaimerBanner (teal) using "future" / "will be able to" language.
12. **Employer Dashboard Preview** — "Product preview · Demonstration data only" amber pill. StatCard row (Active jobs, New applicants, Shortlisted, In interview). Two-column: PremiumCard with applicant pipeline bar chart (5 stages) + recent applicants list (with avatar colored circles cycling teal/emerald/sky/violet/amber); right column with Candidate recommendations card and Listing performance card (top role views + applications). Demonstration data disclaimer.
13. **Matching Methodology** — `tone="muted"`. Heading "How Novalyte Aligns Healthcare Talent and Opportunity." 17 matching factors (Role, Location, Licensure, Licensed states, Specialty, Remote availability, Experience, Employment preference, Schedule, Credential status, Assignment duration, Start date, Shift, Compensation, Organization type, Care setting, Travel radius) as small icon+label cards in `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Amber DisclaimerBanner with the required disclaimer about employer responsibilities (background checks, license confirmation, credential verification, employment eligibility, clinical supervision, compliance, final hiring decisions).
14. **Trust & Responsibility** — Six trust cards (Employer verification, Credential-aware profiles, Secure document handling, Candidate privacy, Profile visibility controls, Listing review & fraud reporting). Muted DisclaimerBanner explicitly stating Novalyte does not represent independent verification and does not guarantee outcomes.
15. **Final Employer CTA** — `tone="tint"`. Rounded-3xl emerald-tinted callout. Heading "Need More Capacity as Patient Demand Grows?" CTAs: "Post a Role" (emerald, `onGetStarted`) + "Find Healthcare Talent" (scrolls to jobs). Note: "Novalyte partner organizations can manage roles from their connected dashboard."
16. **Final Professional CTA** — Dark `bg-foreground` section. Heading "Find Work That Matches Your Credentials, Goals, and Availability." CTAs: "Join as a Professional" (`onGetStarted`) + "Browse Healthcare Roles" (scrolls to jobs). Inlined (not `CTASection`) so the secondary button scrolls to the jobs panel instead of reloading the view.

## Conventions followed

- **Required signature** preserved exactly.
- **Only existing shadcn/ui components** from `@/components/ui/`: button, input, label, badge, select, switch, sheet, pagination, separator.
- **Shared components** from `@/components/shared/`: `PremiumCard`, `MetaRow`, `StatCard`, `CardSkeleton`, `EmptyState`, `FilterChip`, `ViewToggle`, `SaveButton`, `Breadcrumbs` (from enterprise.tsx); `SectionShell`, `SectionHeading` (from section.tsx); `StatusPill`, `CheckItem` (from badges.tsx); `DisclaimerBanner` (from disclaimer.tsx); `SmartImage` (from smart-image.tsx). `VerificationBadge` import dropped (unused in this rewrite).
- **Stores** from `@/lib/nav.ts`: `navigate` (for job-detail navigation), `useSaved` (for save-job toggle).
- **Helpers** from `@/lib/constants.ts`: `splitCsv`, `colorClasses`, `initials`, `US_STATES`.
- **`cn`** from `@/lib/utils`. **Icons** from `lucide-react`. **`toast`** from `sonner`.
- **No indigo/blue as primary** — theme is teal/emerald throughout. Sky used only for the `Remote-eligible` pill in the profile preview.
- **`useTransition` for filter loading** (NOT `useEffect+setState`). `isPending` drives the `CardSkeleton` loading state. `setPage(1)` co-located inside `startTransition` callbacks.
- **`JobDetailView` import kept working** — `navigate("job-detail", undefined, { id: job.id })` from the Apply/View Details buttons.
- **Premium polish**: `PremiumCard` with `hover`, `card-premium-hover`, `novalyte-fade-up` on result grids.
- **Demonstration data clearly labeled** — amber "Demonstration preview" / "Product preview · Demonstration data only" pills above every mock section, plus muted `DisclaimerBanner` underneath.
- **Men's health is one specialty** — listed under "Specialty Care" category with example "Men's Health" alongside Hormone & TRT, Weight Management, Longevity Medicine. Not the page focus.
- **`onGetStarted`** wired to every professional/employer signup CTA.
- **Fully responsive** — mobile-first; categories grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; jobs panel collapses to a Sheet on mobile; ecosystem flow stacks vertically on mobile; mock previews reflow on small screens.
- **TypeScript strict, no `any`** — `JobFilters`, `JobSort`, `JobCard` props, `MOCK_PRO`, `MOCK_APPLICATIONS`, `MOCK_EMPLOYER` all typed.
- **No fabricated metrics** — only real prop-derived counts (jobs.length, professionals.length) shown as numbers. All mock previews explicitly labeled.

## Cross-section communication

The Browse-by-Category section dispatches a `window` CustomEvent (`novalyte:set-job-keyword`) carrying the category keyword. The `JobsSection` registers a one-time `useEffect` listener that calls `applyFilter({ query: keyword })` (which itself runs through `startTransition`). This lets the category grid live below the jobs panel (per the spec ordering) while still driving the jobs filter — and scrolls the user back up to `#browse-jobs`. A `toast` confirms the filter was applied.

## Validation

- `bun run lint` — **clean** (0 errors, 0 warnings).
- Dev server compiles successfully (`✓ Compiled in …` in `dev.log`).

## File path

`/home/z/my-project/src/components/views/workforce-view.tsx` (2121 lines)
