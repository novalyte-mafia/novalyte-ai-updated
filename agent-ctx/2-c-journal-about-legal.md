# Task 2-c — Journal, About & Legal Views

**Agent:** Sub-agent (Z.ai Code)
**Task ID:** 2-c
**Scope:** Build three view components for the Novalyte AI platform — JournalView, AboutView, and LegalView — wired into the existing AppShell.

## Files created
1. `src/components/views/journal-view.tsx` — `"use client"` JournalView
2. `src/components/views/about-view.tsx` — `"use client"` AboutView
3. `src/components/views/legal-view.tsx` — `"use client"` LegalView

## What was built

### JournalView
- Hero section (gradient `from-teal-50/50 to-background`) with headline "Novalyte Journal — Educational content for the men's health economy" and supporting copy separating medical education from clinical advice.
- Category filter: derives unique categories from `articles` via `useMemo`; renders pill buttons including an "All" option. Client-side filter via `useState`.
- Article cards grid (`md:grid-cols-2 lg:grid-cols-3`): category badge, title, line-clamp-3 excerpt, author with `User` icon, medical reviewer with `Stethoscope` icon and "Medical review by" label, reading time ("X min read" with `Clock` icon), published date formatted with `toLocaleDateString`. "Read article" button opens the reader dialog.
- Article reader dialog (`max-w-2xl`, `max-h-[92vh] overflow-y-auto`): full content split by `"\n\n"` into `<p>` paragraphs; category/author/medical reviewer/published/updated dates in a meta grid; references via `splitCsv` rendered as numbered list; related treatment as a teal pill linking to `patients` view; an "Education, not clinical advice" `DisclaimerBanner` (teal); a `MedicalDisclaimer` at the bottom; a "Find a verified clinic" button navigating to the directory.
- Empty state when no articles match the active category.
- `DisclaimerBanner` (tone="teal") at the bottom noting the Journal is educational and not a substitute for professional medical advice.
- Uses `SectionShell`/`SectionHeading`.

### AboutView
- Hero: headline "Building the infrastructure layer for men's health"; supporting copy positions Novalyte AI as a healthcare technology facilitator (NOT medical provider/clinic/pharmacy/diagnostic service).
- Prominent amber `DisclaimerBanner` near the top stating Novalyte AI is a healthcare technology facilitator; not a medical provider/clinic/pharmacy/diagnostic service/replacement for licensed professionals; does not diagnose, prescribe, or provide medical advice; licensed clinics and professionals remain solely responsible for all medical decisions, patient care, prescribing, treatment, credentialing, and regulatory compliance.
- Mission section: 4 cards (Connect demand, Verify clinics, Source talent, Unify services) with icons.
- Approach section: 4-step pipeline (Patients → Clinics → Workforce → Marketplace) showing how Novalyte coordinates the ecosystem.
- Positioning pillars: 4 qualitative cards — "One connected ecosystem", "Verified provider network", "Human-guided technology", "Built for secure healthcare workflows" — NO fake metrics.
- Contact form section: `SectionShell` with name, email, role select (patient/clinic/professional/vendor/investor/other), message, consent checkbox. POSTs to `/api/contact`. Uses `toast` from `sonner` for success/error feedback. Success state replaces the form with a confirmation message. Footer note about emergencies.
- CTA: `CTASection` with primary `onGetStarted` "Join the Novalyte Network" and secondary "Browse Clinic Directory" `secondaryView="directory"`, dark tone.

### LegalView
- Hero header mapping `view` to title (privacy → Privacy Policy, terms → Terms of Service, medical-disclaimer → Medical Disclaimer, accessibility → Accessibility Statement, cookies → Cookie Policy). Eyebrow "Legal". "Last updated: January 15, 2025" displayed.
- "Return home" button in the hero and at the bottom of the page using `navigate("home")`.
- Top-of-page amber `DisclaimerBanner` on EVERY legal page: "This document is a placeholder draft and requires review by qualified legal counsel before production launch."
- Body rendered in a `max-w-3xl` prose-style container using shared `H2`/`H3`/`P`/`UL`/`OL`/`LI` primitives for good typography.
- Five substantive policy pages with multiple headed sections:
  - **Privacy Policy**: 10 sections covering info collected, use, PHI/HIPAA positioning, sharing, retention, security, user rights, children, changes, contact.
  - **Terms of Service**: 13 sections covering nature of service, eligibility, accounts/verification, acceptable use, relationships among participants, IP/licenses, fees, disclaimers, liability, indemnity, termination, governing law, changes.
  - **Medical Disclaimer**: 10 sections explicitly reinforcing: Novalyte AI is a technology platform and does not provide medical care/diagnosis/treatment; assessments do not provide a medical diagnosis; consult a licensed healthcare professional; clinics are independently owned and operated; provider participation does not constitute endorsement; licensure/credentials should be independently confirmed.
  - **Accessibility Statement**: 7 sections covering approach (WCAG 2.1 AA reference), features, known limitations, feedback, accommodations, third-party content, changes.
  - **Cookie Policy**: 7 sections covering what cookies are, types used (strictly necessary/functional/analytics/marketing), third-party cookies, management, retention, updates, contact.
- "Back to top" button (smooth scrolls to top) + "Return home" button + an "Other legal documents" panel with buttons to navigate between the 5 pages.

## Conventions followed
- Used ONLY existing shadcn/ui components: `Button`, `Input`, `Label`, `Textarea`, `Checkbox`, `Select`, `Dialog`, `Badge` (no new UI components created).
- Used shared components: `SectionShell`, `SectionHeading`, `DisclaimerBanner`, `MedicalDisclaimer`, `CTASection`.
- `cn` from `@/lib/utils`; icons from `lucide-react`; `toast` from `sonner`; `navigate` from `@/lib/nav`.
- Teal/emerald theme only — NO indigo or blue.
- Fully responsive (mobile-first with `sm:`/`md:`/`lg:` breakpoints).
- TypeScript strict, no `any`.
- Dates via `new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })`.

## Lint & verification
- `bun run lint` — clean (no errors or warnings).
- `dev.log` — no compile errors related to any of the three new views.

## Integration notes for downstream agents
- These views are already imported and rendered by `src/components/site/app-shell.tsx` (the AppShell switches on `view` and passes the right props).
- `JournalView` takes `{ articles: ArticleT[] }`.
- `AboutView` takes `{ onGetStarted: () => void }`.
- `LegalView` takes `{ view: "privacy" | "terms" | "medical-disclaimer" | "accessibility" | "cookies" }`.
- All three are pure client components with no server-side data dependencies; they rely on `AppShell` to pass `articles` (which already flows from `PlatformData`).
