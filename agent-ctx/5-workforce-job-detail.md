# Task 5 — Workforce Hub + Job Board + Job Detail (enterprise redesign)

Task ID: 5
Agent: Subagent (Workforce + Job Detail redesign)
Files touched:
- `/home/z/my-project/src/components/views/workforce-view.tsx` (overwritten)
- `/home/z/my-project/src/components/views/job-detail-view.tsx` (new)

## Summary

Rebuilt the Workforce Hub as a premium healthcare recruiting marketplace and added a comprehensive Job Detail view. Both views lean on the new enterprise shared components from Task 4 (`PremiumCard`, `MetaRow`, `StatCard`, `EmptyState`, `FilterChip`, `ViewToggle`, `SaveButton`, `Breadcrumbs`, `StickyTabNav`) plus the existing shadcn/ui primitives, with teal/emerald (sky/violet/amber accents) and no indigo/blue as primary.

## WorkforceView (`workforce-view.tsx`) — File 1

Layout (top → bottom):
1. **Hero** — `from-teal-50/50 to-background` gradient, eyebrow pill `Workforce Hub`, headline "Specialized Talent for the Future of Men's Health", supporting copy naming every required role (Physicians, NPs, PAs, RNs, MAs, Phlebotomists, Medical Directors, Patient Coordinators, Telehealth professionals, Compliance specialists, Clinic administrators, Revenue Cycle specialists). Two CTAs (`Join as a Professional` + `Post a Role`) → `onGetStarted`. Followed by a 4-column grid of **qualitative** trust indicators (`TrustItem`): "Verified credential flow", "Multi-state licensure matching", "Direct clinic applications", "Men's-health specialties" — no fake numbers.
2. **Tabs** — `Browse Jobs` (default) + `Browse Professionals`.
3. **Browse Jobs (flagship job board)**:
   - **Filter sidebar** — sticky `aside` on `lg+` (280px wide, `top-20`, max-h `calc(100vh-6rem)`, custom scrollbar); collapses to a left-side `Sheet` on mobile (Filters button with chip count badge). Filters: keyword `Input` (with `Search` icon), State select (US_STATES), Employment-type select (derived unique), Compensation-range select (All / $0–50k / $50k–100k / $100k–150k / $150k+, overlap test against job compMin/compMax), Required-license select (derived from splitCsv(requiredLicenses)), Treatment-specialty select (derived from splitCsv(treatmentSpecialties)), Remote-only `Switch`.
   - **Sort** — `Select` (Most relevant, Newest, Compensation: high→low, Compensation: low→high). Mobile + desktop variants.
   - **ViewToggle** — grid/list using `LayoutGrid` / `List` icons (only on Jobs tab per spec).
   - **Applied filter chips** — `FilterChip` for every active filter + a "Clear all" text button. Each chip routes through `applyFilter({...})` so removing one also resets page to 1 and re-triggers the 300 ms loading shimmer.
   - **Results header** — "Showing X of Y opportunities" derived strictly from filtered length.
   - **Job cards** — `PremiumCard` with `hover` (uses `card-premium-hover`). Top row: clinic name (uppercase muted) + `Featured` amber pill (top 2 of default sort) + `Verified employer` `StatusPill` (emerald, when featured) + `SaveButton` (uses `useSaved` store with kind="job"). Clickable job title → `navigate("job-detail", undefined, { id: job.id })`. Location/employment/remote pills (`MapPin` / `Briefcase` / `RemotePill`: teal for remote, muted for on-site). Compensation row uses `Banknote` + emerald-bold `formatComp` output ("$120k–$145k" / "From $Xk" / "$X/hr" / "Competitive"). Treatment specialties as teal outline badges. Required licenses as muted outline badges. Description `line-clamp-2`. Schedule row with `CalendarDays`. Footer row: required-experience + application-requirements count (via `ListChecks`), plus `Apply now` primary button + `View details` outline button (both navigate to job-detail).
   - **Empty state** — `EmptyState` from enterprise.tsx with `Briefcase` icon, message, and `Clear filters` button.
   - **Pagination** — `@/components/ui/pagination` with `PaginationPrevious` / `PaginationNext` / numbered `PaginationLink`s + `PaginationEllipsis` when total pages > 7. 10 items per page.
   - **Loading skeleton** — 300 ms simulated loading via `useEffect` that schedules `setLoading(false)` after 300 ms; `setLoading(true)` is fired synchronously in the change handlers (`applyFilter`, `applySort`, `applyView`, `clearAll`) so we don't trip the `react-hooks/set-state-in-effect` rule. While loading, a 6-up `CardSkeleton` grid is rendered.
4. **Browse Professionals** — same premium treatment: filter sidebar (Keyword, State, Title derived, Specialty derived, Remote `Switch`, Verified `Switch`), sort select (Most relevant / Years experience: high→low / Verified first), applied chips, results header, `CardSkeleton` loading shimmer (300 ms), 3-up `PremiumCard` grid with `novalyte-fade-up`, professional card (avatar in colored circle cycling teal/emerald/sky/violet/amber via `colorClasses("blue")` for sky, name+title, location with `MapPin`, sky `Remote` pill, `VerificationBadge`, licensed states, max-3 specialties, experience/availability/employment row, bio `line-clamp-2`, "View profile" button → opens full `Dialog` with bio, MetaRow of experience/availability/employment pref, licensed states, specialties, certifications, muted `DisclaimerBanner`). Empty state + pagination.
5. **Matching logic** — `SectionShell` tone="muted" + `SectionHeading` eyebrow "How Matching Works". 10-factor grid (`Role`, `Location`, `Licensure`, `Licensed states`, `Specialty`, `Remote availability`, `Experience`, `Employment preference`, `Schedule`, `Credential status`) as small cards (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`), each with an icon-tinted square + check icon + label.
6. **Disclaimer** — `DisclaimerBanner` tone="amber" with the exact required copy about Novalyte facilitating discovery/communication and clinics remaining responsible for background checks, credential verification, licensing confirmation, employment compliance, clinical supervision, and hiring decisions.
7. **CTA** — `CTASection` with title "Hiring for your men's health clinic?", `onPrimary={onGetStarted}`, `primaryLabel="Post a Role"`, `secondaryLabel="Browse Marketplace"`, `secondaryView="marketplace"`.

## JobDetailView (`job-detail-view.tsx`) — File 2

A comprehensive detail page with sticky tab navigation:
- **Breadcrumbs** — `Breadcrumbs` from enterprise.tsx: `Workforce` (click → `navigate("workforce")`) → clinic name (click → back to workforce) → job title.
- **Hero header** — `from-teal-50/50 to-background` gradient. Left: clinic name (uppercase muted, clickable → back to workforce), large job title (`text-3xl sm:text-4xl`), location/employment/remote pills row (`MapPin`, `Briefcase`, `RemotePill`), prominent compensation card (emerald border, `Banknote` icon, compensation label + value, "Transparent" pill), action row (`Apply now` primary → `scrollToApply()`, `SaveButton` with `useSaved` kind="job", `Back to jobs` ghost button → `navigate("workforce")`). Right: employer snapshot `PremiumCard` (clinic name + city/state, MetaRow-style dl of Type/Comp/Experience/Remote, Verified employer + Hiring status pills).
- **StickyTabNav** — tabs: Overview (`Info`), Requirements (`ListChecks`), Compensation & Benefits (`Banknote`), Schedule (`CalendarDays`), How to Apply (`Send`). Right slot: a small "Apply now" `Button` that calls `scrollToApply()`.
- **Overview tab** — `SectionLabel` + position overview (paragraphs split from `description` by `\n{2,}|\n`), 6-cell `MetaRow` (Clinic, Location, Type, Remote, Experience, Compensation), treatment specialties as teal outline badges, required licenses as muted outline badges.
- **Requirements tab** — required experience card, required licenses as 2-col grid of icon-prefixed chips, application requirements as `CheckItem` list (splitCsv), credential & compliance expectations `PremiumCard` with 5 `CheckItem`s covering active licensure, board certifications/DEA/malpractice, men's-health experience, HIPAA/OSHA/telehealth compliance, and clinic background/credentialing.
- **Compensation & Benefits tab** — 3-up `StatCard` row (Range / Min / Max, emerald tone on Range), teal `DisclaimerBanner` clarifying Novalyte doesn't set compensation. Benefits `PremiumCard` noting specific benefits confirmed during hiring. Schedule `PremiumCard` with employment-type / remote / location pills.
- **Schedule tab** — schedule `PremiumCard`, `MetaRow` of Employment type / Work model / City / State, remote vs on-site `PremiumCard` explaining telehealth licensure responsibilities.
- **How to Apply tab** — `#apply-form` anchor (scroll-mt-32). Description + 3-cell MetaRow. `PremiumCard` application form: Full name (required), Email (required type=email), Phone (optional), Cover note `Textarea` (optional), consent checkbox with the required disclosure text. Submit `Button` posts `POST /api/job-application` with `{ jobPostingId, applicantName, applicantEmail, applicantPhone, coverNote }`. `toast` from sonner for success/error. Success state: `CheckCircle2` in teal square + confirmation + "Submit another response" button. Muted `DisclaimerBanner` about Novalyte routing applications.
- **Related jobs** — `SectionShell` tone="muted", 3-card grid of related jobs (scored by shared specialty +3, same state +2, same employment type +1, shared license +1, same clinic +1; filled to 3 with non-matching jobs if fewer than 3 matches). Each compact `RelatedJobCard` (PremiumCard hover) navigates via `navigate("job-detail", undefined, { id })`.
- **Disclaimer** — `DisclaimerBanner` tone="amber" reiterating Novalyte facilitates discovery/communication, clinics remain responsible for hiring/credentialing, applications do not constitute an offer of employment.

## Lint + rules

- Both files pass `bun run lint` cleanly (zero errors, zero warnings). Remaining lint errors in `product-detail-view.tsx` and `vendor-profile-view.tsx` belong to other agents' parallel work and are out of scope for Task 5.
- Strict TypeScript, no `any` types — `ApplicationForm` typed explicitly; `JobFilters`, `JobSort`, `ProFilters`, `ProSort`, `TabId` all typed.
- Teal/emerald primary throughout, sky used for `Remote` pills and avatar slot 3, amber for `Featured` and disclaimer, emerald for compensation emphasis, violet for the avatar cycle. No indigo/blue as primary.
- All interactive elements have hover/active/focus states (PremiumCard `card-premium-hover`, `SaveButton` transitions, `FilterChip` remove-button hover, pagination `aria-disabled` opacity).
- Result grids use `novalyte-fade-up` for entrance.
- `setPage(1)` and `setLoading(true)` are co-located in the change handlers (`applyFilter`, `applySort`, `applyView`, `clearAll`) — NOT in effects — to satisfy `react-hooks/set-state-in-effect`. The 300 ms `setLoading(false)` is wrapped in `setTimeout` inside a `useEffect` so it is not synchronous to the effect body.
- No `react-hooks/refs` violations — solved by removing the `useRef` timer approach and using the simpler "setLoading(true) in handler + useEffect schedules setLoading(false) via setTimeout" pattern.
- Initial bug fixed: the `relatedJobs` `useMemo` was recursively passing `relatedJobs` to `relatedJobsFill` instead of the local `scored` array — corrected to `relatedJobsFill(allJobs, job, scored)`.
