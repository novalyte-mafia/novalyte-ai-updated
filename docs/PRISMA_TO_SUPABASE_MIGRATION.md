# Prisma to Supabase Migration and Integration Documentation

This document records the migration of the Novalyte AI database layer from **Prisma ORM (SQLite)** to **Supabase (PostgreSQL)**, covering schemas, client utilities, RLS security configurations, and event logging patterns.

---

## 1. Architecture Overview

### Previous Architecture
- **ORM**: Prisma Client.
- **Database Engine**: SQLite local file database (`prisma/custom.db`).
- **Data Definition**: `schema.prisma` files and Prisma CLI commands (`prisma db push`, `prisma generate`).
- **Date Handling**: Native JavaScript `Date` objects parsed by Prisma Client engine.

### New Supabase Architecture
- **ORM / Client SDK**: `@supabase/supabase-js` (with admin and client configurations).
- **Database Engine**: Supabase Cloud PostgreSQL database in the `us-west-2` (Oregon) region.
- **Data Access Layer**: A unified database adapter in `src/lib/db.ts` that implements the Prisma contract, mapping database operations (`findMany`, `findUnique`, `create`, `update`, `deleteMany`, `upsert`, `count`) transparently to PostgREST select/insert/update/delete calls.
- **Dynamic Relations**: Nested creations are mapped using secondary relational inserts. Dynamic includes (`include: { locations: true, providers: true, ... }`) are fetched in a single network trip using PostgREST's relational select operators (e.g. `locations:ClinicLocation(*)`).
- **Date Handling**: Supabase timestamp strings are automatically parsed back into native JavaScript `Date` objects to ensure compatibility with all existing formatting functions in the application views.

---

## 2. Supabase Client Configurations

We initialized three distinct clients inside `src/lib/supabase/`:

1. **Browser Client (`src/lib/supabase/client.ts`)**
   - Created with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Used for client-side operations and subscriptions.
2. **Server Client (`src/lib/supabase/server.ts`)**
   - Wrapper for server components and routes that dynamically instantiates standard client connections.
3. **Admin Client (`src/lib/supabase/admin.ts`)**
   - Privileged backend client configured with `SUPABASE_SERVICE_ROLE_KEY`.
   - Runtime checks throw errors if imported into the browser.
   - Bypasses RLS to perform secure onboarding updates, applications, and seeds.

---

## 3. Database Schema & Mappings

The tables are created in the `public` schema. All IDs are stored as `TEXT` containing UUID strings (`uuid_generate_v4()::text`) to prevent type mismatch errors in the frontend routes.

### Tables Map

| Prisma Model | Supabase Table | Primary Key | Key Relations |
| :--- | :--- | :--- | :--- |
| `Clinic` | `"Clinic"` | `id` (TEXT) | `locations`, `providers`, `treatments`, `reviews` |
| `ClinicLocation` | `"ClinicLocation"` | `id` (TEXT) | references `Clinic(id)` |
| `ClinicProvider` | `"ClinicProvider"` | `id` (TEXT) | references `Clinic(id)` |
| `ClinicTreatment` | `"ClinicTreatment"` | `id` (TEXT) | references `Clinic(id)` |
| `ClinicReview` | `"ClinicReview"` | `id` (TEXT) | references `Clinic(id)` |
| `Professional` | `"Professional"` | `id` (TEXT) | `applications` |
| `JobPosting` | `"JobPosting"` | `id` (TEXT) | `applications` |
| `JobApplication` | `"JobApplication"` | `id` (TEXT) | references `JobPosting(id)`, `Professional(id)` |
| `Vendor` | `"Vendor"` | `id` (TEXT) | `listings` |
| `MarketplaceListing`| `"MarketplaceListing"` | `id` (TEXT) | references `Vendor(id)` |
| `QuoteRequest` | `"QuoteRequest"` | `id` (TEXT) | references `MarketplaceListing(id)` |
| `Article` | `"Article"` | `id` (TEXT) | |
| `AssessmentSubmission`| `"AssessmentSubmission"` | `id` (TEXT) | |
| `ConsultationRequest`| `"ConsultationRequest"`| `id` (TEXT) | references `Clinic(id)` |
| `ContactSubmission` | `"ContactSubmission"` | `id` (TEXT) | |
| `NewsletterSignup` | `"NewsletterSignup"` | `id` (TEXT) | |
| `ClinicOnboarding` | `"ClinicOnboarding"` | `id` (TEXT) | |
| `ClinicApplication` | `"ClinicApplication"` | `id` (TEXT) | |
| `ProfessionalOnboarding`| `"ProfessionalOnboarding"`| `id` (TEXT) | |
| `VendorOnboarding` | `"VendorOnboarding"` | `id` (TEXT) | |
| `AuditLog` | `"AuditLog"` | `id` (TEXT) | |
| *custom table* | `"workforce_professional_applications"`| `id` (TEXT) | Custom professional onboarding applications |

### workforce_professional_applications Schema
- `id` (TEXT, PK): UUID.
- `first_name` (TEXT): Applicant's first name.
- `last_name` (TEXT): Applicant's last name.
- `email` (TEXT): Verified email address.
- `phone` (TEXT): Contact number.
- `professional_title` (TEXT): Professional headline or role.
- `bio` (TEXT): Short summary bio.
- `state_or_location` (TEXT): License or residence state.
- `resume_url` (TEXT): Resulting path/URL reference to résumé.
- `linkedin_url` (TEXT): LinkedIn link.
- `employment_history` (JSONB): Employment list array.
- `education` (JSONB): Education entries list.
- `licenses` (JSONB): Licensing and credentials.
- `specialties` (JSONB): Selected clinical specialties.
- `employment_preference` (JSONB): Preferred employment types.
- `work_arrangement` (TEXT): On-site, remote, or hybrid.
- `relocation_preference` (BOOLEAN): Willingness to relocate.
- `telehealth_availability` (BOOLEAN): Telehealth availability.
- `visibility_settings` (JSONB): Profile visibility checkboxes.
- `application_status` (TEXT): Status string (`submitted`, `under_review`, `contacted`, `interviewing`, `approved`, `rejected`, `withdrawn`).
- `internal_notes` (TEXT): Admin-only evaluation comments.
- `created_at` (TIMESTAMPTZ).
- `updated_at` (TIMESTAMPTZ).

---

## 4. Row-Level Security (RLS) & Storage

### Row-Level Security Policies
1. **Public SELECT Tables**: Read access is open to all users for public directory tables (`Clinic`, `ClinicLocation`, `ClinicProvider`, `ClinicTreatment`, `ClinicReview`, `Professional`, `JobPosting`, `Vendor`, `MarketplaceListing`, `Article`), allowing seamless search and browsing without authentication.
2. **Public INSERT-Only Tables**: Submissions tables (`AssessmentSubmission`, `workforce_professional_applications`, `JobApplication`, `QuoteRequest`, `ConsultationRequest`, `ContactSubmission`, `NewsletterSignup`, `ClinicOnboarding`, `ClinicApplication`, `ProfessionalOnboarding`, `VendorOnboarding`) allow public inserts (anonymous submissions), but define no SELECT or UPDATE permission. This ensures anonymous users cannot read, list, or edit existing records.
3. **Privileged Access**: Administrative updates, dashboard changes, and review processing are executed via the server-side Admin Client using the privileged service-role key, bypassing RLS safely.

### Storage Bucket Configuration
For clinic media and provider headshots, configure the following storage bucket in the Supabase Dashboard:
- **Bucket ID**: `clinic-media`
  - **Type**: Publicly Readable.
  - **RLS Policy**: Only authenticated administrators or owners can insert/update/delete media files.

---

## 5. Development & Verification Commands

We modified the database scripts inside `package.json`:

```bash
# Push schema migrations and RLS policies
npm run db:push

# Generate TypeScript database types
npm run db:generate

# Seed database mock fixtures
npm run db:seed
```

---

## 6. Rollback & Troubleshooting

### Direct Direct connection timeout
If direct connection (`db.iuuhcnwqozjrehmgpcqo.supabase.co`) fails with a network timeout, it is because your current network interface does not support IPv6 routing. Use the connection pooler URL on port `6543` (transaction) or `5432` (session) as configured in your `.env`.

### Resetting Schema
To drop and rebuild the remote tables, run the DDL queries inside `prisma/supabase_migration.sql` and `prisma/supabase_migration_rls.sql` directly using the Supabase SQL editor or CLI client, then execute `npm run db:seed`.
