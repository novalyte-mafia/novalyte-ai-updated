-- Create workforce_professional_applications table
CREATE TABLE IF NOT EXISTS "workforce_professional_applications" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "professional_title" TEXT,
  "bio" TEXT,
  "state_or_location" TEXT,
  "resume_url" TEXT,
  "linkedin_url" TEXT,
  "employment_history" JSONB DEFAULT '[]'::jsonb,
  "education" JSONB DEFAULT '[]'::jsonb,
  "licenses" JSONB DEFAULT '[]'::jsonb,
  "specialties" JSONB DEFAULT '[]'::jsonb,
  "employment_preference" JSONB DEFAULT '[]'::jsonb,
  "work_arrangement" TEXT,
  "relocation_preference" BOOLEAN DEFAULT false,
  "telehealth_availability" BOOLEAN DEFAULT false,
  "visibility_settings" JSONB DEFAULT '{}'::jsonb,
  "application_status" TEXT NOT NULL DEFAULT 'submitted',
  "internal_notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS globally on public data tables
ALTER TABLE "Clinic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicLocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicProvider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicTreatment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Professional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobPosting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vendor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MarketplaceListing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Article" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on form submissions and applications
ALTER TABLE "AssessmentSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workforce_professional_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsultationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSignup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicOnboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalOnboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VendorOnboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow public read clinics" ON "Clinic";
DROP POLICY IF EXISTS "Allow public read locations" ON "ClinicLocation";
DROP POLICY IF EXISTS "Allow public read providers" ON "ClinicProvider";
DROP POLICY IF EXISTS "Allow public read treatments" ON "ClinicTreatment";
DROP POLICY IF EXISTS "Allow public read reviews" ON "ClinicReview";
DROP POLICY IF EXISTS "Allow public read professionals" ON "Professional";
DROP POLICY IF EXISTS "Allow public read job postings" ON "JobPosting";
DROP POLICY IF EXISTS "Allow public read vendors" ON "Vendor";
DROP POLICY IF EXISTS "Allow public read marketplace listings" ON "MarketplaceListing";
DROP POLICY IF EXISTS "Allow public read articles" ON "Article";

DROP POLICY IF EXISTS "Allow public insert assessment" ON "AssessmentSubmission";
DROP POLICY IF EXISTS "Allow public insert workforce" ON "workforce_professional_applications";
DROP POLICY IF EXISTS "Allow public insert job applications" ON "JobApplication";
DROP POLICY IF EXISTS "Allow public insert quote requests" ON "QuoteRequest";
DROP POLICY IF EXISTS "Allow public insert consultation" ON "ConsultationRequest";
DROP POLICY IF EXISTS "Allow public insert contact" ON "ContactSubmission";
DROP POLICY IF EXISTS "Allow public insert newsletter" ON "NewsletterSignup";
DROP POLICY IF EXISTS "Allow public insert clinic onboarding" ON "ClinicOnboarding";
DROP POLICY IF EXISTS "Allow public insert clinic app" ON "ClinicApplication";
DROP POLICY IF EXISTS "Allow public insert professional onboarding" ON "ProfessionalOnboarding";
DROP POLICY IF EXISTS "Allow public insert vendor onboarding" ON "VendorOnboarding";

-- Public SELECT policies (anyone can read directories and articles)
CREATE POLICY "Allow public read clinics" ON "Clinic" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read locations" ON "ClinicLocation" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read providers" ON "ClinicProvider" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read treatments" ON "ClinicTreatment" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read reviews" ON "ClinicReview" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read professionals" ON "Professional" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read job postings" ON "JobPosting" FOR SELECT TO public USING ("status" = 'open');
CREATE POLICY "Allow public read vendors" ON "Vendor" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read marketplace listings" ON "MarketplaceListing" FOR SELECT TO public USING ("reviewStatus" = 'approved');
CREATE POLICY "Allow public read articles" ON "Article" FOR SELECT TO public USING (status = 'published');

-- Public INSERT-only policies (submitting forms)
CREATE POLICY "Allow public insert assessment" ON "AssessmentSubmission" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert workforce" ON "workforce_professional_applications" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert job applications" ON "JobApplication" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert quote requests" ON "QuoteRequest" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert consultation" ON "ConsultationRequest" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert contact" ON "ContactSubmission" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert newsletter" ON "NewsletterSignup" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert clinic onboarding" ON "ClinicOnboarding" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert clinic app" ON "ClinicApplication" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert professional onboarding" ON "ProfessionalOnboarding" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert vendor onboarding" ON "VendorOnboarding" FOR INSERT TO public WITH CHECK (true);

-- Indexes for performance and quick searching
CREATE INDEX IF NOT EXISTS "idx_wpa_email" ON "workforce_professional_applications"("email");
CREATE INDEX IF NOT EXISTS "idx_wpa_status" ON "workforce_professional_applications"("application_status");
CREATE INDEX IF NOT EXISTS "idx_wpa_created" ON "workforce_professional_applications"("created_at");
CREATE INDEX IF NOT EXISTS "idx_clinic_verified" ON "Clinic"("verified");
CREATE INDEX IF NOT EXISTS "idx_job_status" ON "JobPosting"("status");
CREATE INDEX IF NOT EXISTS "idx_listing_status" ON "MarketplaceListing"("reviewStatus");
CREATE INDEX IF NOT EXISTS "idx_article_status" ON "Article"("status");
