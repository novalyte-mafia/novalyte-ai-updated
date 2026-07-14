# Novalyte AI — The Operating System for Men's Health

Novalyte AI is a production-oriented healthcare **technology** platform that connects patient demand, verified clinics, specialized healthcare professionals, equipment suppliers, and operational services through one intelligent healthcare ecosystem.

> **Important legal positioning:** Novalyte AI is a healthcare technology *facilitator*. It is **not** a medical provider, clinic, pharmacy, or diagnostic service. The platform does not diagnose conditions, prescribe treatment, or provide medical advice. Licensed clinics and healthcare professionals remain responsible for all medical decisions, patient care, prescribing, treatment, credentialing, and regulatory compliance.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [The Four Connected Pillars](#the-four-connected-pillars)
4. [Local Development](#local-development)
5. [Database](#database)
6. [Project Structure](#project-structure)
7. [Forms & API Routes](#forms--api-routes)
8. [Design System](#design-system)
9. [Trust, Privacy & Compliance Language](#trust-privacy--compliance-language)
10. [Integrations Requiring External Credentials](#integrations-requiring-external-credentials)
11. [Deployment](#deployment)
12. [Production Hardening Checklist](#production-hardening-checklist)

---

## Architecture Overview

Novalyte AI is built as a **single cohesive ecosystem** rather than four unrelated websites under one brand. The public experience is delivered through a Next.js 16 App Router application with a client-side **view router** (Zustand) that switches between connected "views" — Home, For Patients, For Clinics, Clinic Directory, Workforce Hub, Marketplace, Journal, About, and Legal pages — while keeping every pillar connected to the same data layer and design language.

```
Patients discover care → Clinics receive demand → Clinics access talent → Clinics source services → Novalyte AI coordinates the entire men's health economy.
```

**Key architectural decisions:**

- **Server-side data fetching.** The root route fetches clinics, professionals, jobs, marketplace listings, and articles from Prisma on the server and hydrates the client shell.
- **Client-side view switching** via a Zustand store (`src/lib/nav.ts`) keeps navigation instant and the experience app-like, while every view is reachable and deeply integrated.
- **Secure API routes** handle all form submissions with Zod validation and Prisma persistence — no client-side mutations touch the database directly.
- **No mock data in production flows.** Every list, card, and form result is backed by the database. The only clearly-labeled "fixtures" appear in the *Clinic Dashboard preview* component, which is explicitly marked as development-only.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** (strict) |
| Styling | **Tailwind CSS 4** + **shadcn/ui** (New York) |
| UI primitives | Radix UI, Lucide icons |
| Database | **Prisma ORM** (SQLite client — swap to PostgreSQL/Supabase for production) |
| Forms | React Hook Form + Zod (validation on both client and server) |
| State | Zustand (client), server components (data) |
| Notifications | Sonner toasts |
| Animation | Framer Motion, Tailwind transitions |

> **Note on Supabase:** The schema in `prisma/schema.prisma` is designed to map cleanly to PostgreSQL/Supabase. To move to Supabase, change the datasource provider to `postgresql`, set `DATABASE_URL` to your Supabase connection string, and add Row-Level Security policies (see [Production Hardening](#production-hardening-checklist)).

---

## The Four Connected Pillars

1. **Intelligent Patient Acquisition** — Educational content, informational assessments, and structured intake that route high-intent patients to the right care.
2. **Verified Clinic Directory** — Searchable directory of men's health clinics with explicit verification status (no auto-verification).
3. **On-Demand Workforce Hub** — Specialized talent marketplace (physicians, NPs, PAs, RNs, MAs, phlebotomists, medical directors, coordinators, RCM specialists) with licensure- and specialty-aware matching.
4. **Healthcare Services Marketplace** — B2B marketplace for labs, equipment, supplies, software, billing, credentialing, compliance, and staffing — with an administrative moderation process for vendor and listing review.

---

## Local Development

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
#   → DATABASE_URL is pre-configured for local SQLite

# 3. Push the database schema
bun run db:push

# 4. Seed development fixtures (clearly marked, dev-only sample data)
bun x tsx prisma/seed.ts

# 5. Start the dev server (port 3000)
bun run dev
```

Open the **Preview Panel** on the right to view the application. You can click **"Open in New Tab"** above the Preview Panel for a separate browser tab.

### Useful scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server on port 3000 |
| `bun run lint` | ESLint (Next.js + TypeScript rules) |
| `bun run db:push` | Push Prisma schema to the database |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun x tsx prisma/seed.ts` | Seed development-only sample data |

---

## Database

The Prisma schema (`prisma/schema.prisma`) defines the full data model:

- **Clinics** — directory entries with verification workflow (`pending` / `under_review` / `verified` / `rejected`), soft-delete, and indexed by state/slug.
- **Professionals** + **JobPostings** + **JobApplications** — workforce entities with licensure, specialty, and matching-relevant fields.
- **Vendors** + **MarketplaceListings** + **QuoteRequests** — marketplace entities with a review/moderation status pipeline.
- **Articles** — journal content with medical reviewer, references, and related treatment.
- **AssessmentSubmissions** — informational patient assessments (explicitly *not* a diagnosis) with matched clinic IDs.
- **ConsultationRequests**, **ContactSubmissions**, **NewsletterSignups** — inbound forms.
- **ClinicOnboarding**, **ProfessionalOnboarding**, **VendorOnboarding** — role-based onboarding applications.
- **AuditLog** — audit trail foundation.

All list-typed data is stored as comma-separated strings (SQLite/Prisma primitives cannot be arrays). Use the `splitCsv()` helper from `src/lib/constants.ts` to parse.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, metadata, toasts
│   ├── page.tsx                # Server component: fetches data, renders AppShell
│   ├── globals.css            # Custom theme (warm off-white + teal/emerald)
│   └── api/                   # Secure API routes (Zod + Prisma)
│       ├── contact/           ├── consultation/
│       ├── assessment/        ├── quote/
│       ├── newsletter/        ├── clinic-onboarding/
│       ├── professional-onboarding/ ├── vendor-onboarding/
│       └── job-application/
├── components/
│   ├── site/                  # Header, Footer, AppShell, GetStartedDialog, Logo
│   ├── sections/              # Homepage sections (hero, pillars, journey, etc.)
│   ├── shared/                # Reusable: SectionShell, badges, CTA, disclaimers
│   ├── views/                 # The connected "pages"
│   │   ├── home-view.tsx
│   │   ├── patients-view.tsx  (+ patient-assessment.tsx)
│   │   ├── clinics-view.tsx
│   │   ├── directory-view.tsx
│   │   ├── workforce-view.tsx
│   │   ├── marketplace-view.tsx
│   │   ├── journal-view.tsx
│   │   ├── about-view.tsx
│   │   └── legal-view.tsx
│   └── ui/                    # shadcn/ui primitives
└── lib/
    ├── db.ts                  # Prisma client
    ├── nav.ts                 # Zustand view-router store
    ├── constants.ts           # Treatments, pillars, categories, helpers
    ├── types.ts               # Serializable view data shapes
    └── treatments.ts          # Treatment category educational content
prisma/
├── schema.prisma
└── seed.ts                    # ⚠️ Development-only sample data
```

---

## Forms & API Routes

Every form validates on the client **and** the server (Zod), persists to the database via Prisma, and returns structured success/error responses with toast feedback.

| Route | Purpose |
|---|---|
| `POST /api/consultation` | Patient requests a clinic consultation |
| `POST /api/assessment` | Informational patient assessment (no diagnosis) |
| `POST /api/quote` | Marketplace quote request |
| `POST /api/job-application` | Apply to a workforce job posting |
| `POST /api/clinic-onboarding` | Clinic requests platform access |
| `POST /api/professional-onboarding` | Professional onboarding application |
| `POST /api/vendor-onboarding` | Vendor onboarding application |
| `POST /api/contact` | General contact form |
| `POST /api/newsletter` | Newsletter signup |

All forms include consent language where appropriate and clearly state that Novalyte AI is a technology platform.

---

## Design System

A **premium, light-first** healthcare technology aesthetic:

- **Foundations:** White and warm off-white backgrounds, soft gray section backgrounds, deep navy/charcoal text.
- **Accents:** Restrained teal (primary) and emerald (secondary). Dark sections used strategically (dashboard preview, final CTAs).
- **Components:** Clean cards, subtle borders, soft shadows, spacious layouts, strong typography.
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation, visible focus states, 44px+ touch targets.
- **Responsive:** Mobile-first with `sm:`/`lg:` breakpoints. Sticky header with mobile sheet menu. Sticky footer (`min-h-screen flex flex-col` + `mt-auto`).

---

## Trust, Privacy & Compliance Language

Carefully written disclaimers appear throughout the platform and on dedicated legal pages:

- **Novalyte AI is a technology platform and does not provide medical care.**
- Information presented is for educational and informational purposes.
- Assessments do **not** provide a medical diagnosis.
- Patients should consult a licensed healthcare professional before making medical decisions.
- Clinics are independently owned and operated.
- Provider participation does not constitute endorsement unless explicitly stated.
- Licensure and credential information should be independently confirmed where appropriate.

**Dedicated legal pages** (Privacy Policy, Terms of Service, Medical Disclaimer, Accessibility, Cookie Policy) are accessible from the footer. Each is clearly labeled as a **placeholder draft requiring review by qualified legal counsel before production launch**.

We do **not** make unsupported compliance claims (e.g. "HIPAA certified"). Language used: *"Designed for secure healthcare workflows"*, *"Built with privacy-conscious infrastructure"*, *"Supports compliant operational processes"*.

---

## Integrations Requiring External Credentials

The following integrations are architected but **require external credentials** before they can operate in production:

| Integration | Status | What's needed |
|---|---|---|
| **Supabase** (DB / Auth / Storage / RLS) | Architecture-ready | Set `DATABASE_URL` to Supabase Postgres; configure Auth + RLS policies |
| **NextAuth.js** | Dependency installed | Configure auth provider + role model (Patient, Clinic, Professional, Vendor, Admin, etc.) |
| **Stripe** | Architecture-ready (Stripe-ready) | Add Stripe keys; implement checkout/subscription routes |
| **Resend** | Architecture-ready (Resend-ready) | Add Resend API key; wire transactional email for form confirmations |
| **Email delivery** | Not yet wired | Transactional email for consultation/assessment/onboarding confirmations |
| **Authentication & protected dashboards** | Role model designed | Implement login, protected routes, and role-based dashboards (Patient, Clinic, Professional, Vendor, Admin) |
| **Admin verification queues** | Data model ready | Build admin UI for clinic/professional/vendor verification and listing moderation |
| **Rate limiting** | Architecture-ready | Add rate-limiting middleware for API routes |
| **Observability/logging** | AuditLog model ready | Wire structured logging + audit trail capture |

No fabricated live data is shown for any unintegrated feature. Where a backend integration is not yet complete, the platform either uses the local database (for real flows) or is clearly marked as a preview/development fixture (e.g. the Clinic Dashboard preview).

---

## Deployment

The app is **Vercel-compatible** and uses `output: "standalone"`.

```bash
# Build
bun run build

# Or deploy to Vercel
vercel deploy
```

**Environment variables** (see `.env.example`):

```
DATABASE_URL="file:./db/custom.db"   # local SQLite — use Postgres/Supabase URL in production
```

---

## Production Hardening Checklist

Before production launch:

- [ ] Migrate database to PostgreSQL/Supabase; enable Row-Level Security
- [ ] Implement NextAuth authentication with the full role model
- [ ] Build protected, role-based dashboards (Patient / Clinic / Professional / Vendor / Admin)
- [ ] Wire Stripe for marketplace transactions and subscriptions
- [ ] Wire Resend for transactional email
- [ ] Implement admin verification queues (clinic / professional / vendor / listing moderation)
- [ ] Add rate limiting to API routes
- [ ] Complete attorney review of all legal pages
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] SEO validation (sitemap, robots, structured data, Open Graph)
- [ ] Performance audit (Core Web Vitals)
- [ ] Replace development seed data with real content
- [ ] Configure observability and structured logging
- [ ] Verify all medical disclaimers with qualified counsel

---

## Final Product Principle

> Novalyte AI is not four unrelated websites under one brand. Every feature reinforces one connected ecosystem: **Patients discover care. Clinics receive demand. Clinics access talent. Clinics source services. Novalyte AI coordinates the entire men's health economy.**

© Novalyte AI. Built as a credible, scalable, production-oriented healthcare technology platform.
