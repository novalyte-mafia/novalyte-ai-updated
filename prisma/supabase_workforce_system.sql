-- workforce_professional_profiles
CREATE TABLE IF NOT EXISTS "workforce_professional_profiles" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "bio" TEXT,
  "category" TEXT,
  "specialty" TEXT,
  "experience" INTEGER DEFAULT 0,
  "availability" TEXT DEFAULT 'open',
  "relocate" BOOLEAN DEFAULT false,
  "pronouns" TEXT,
  "status" TEXT DEFAULT 'account_created',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_social_links
CREATE TABLE IF NOT EXISTS "professional_social_links" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "linkedin" TEXT,
  "website" TEXT,
  "portfolio" TEXT,
  "github" TEXT,
  "researchgate" TEXT,
  "orcid" TEXT,
  "scholar" TEXT,
  "visibility" TEXT DEFAULT 'visible_to_verified_employers',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_employment_history
CREATE TABLE IF NOT EXISTS "professional_employment_history" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "employer" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT,
  "current" BOOLEAN DEFAULT false,
  "description" TEXT,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_education
CREATE TABLE IF NOT EXISTS "professional_education" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "school" TEXT NOT NULL,
  "degree" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "graduationYear" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_licenses
CREATE TABLE IF NOT EXISTS "professional_licenses" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "expires" TEXT,
  "status" TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_certifications
CREATE TABLE IF NOT EXISTS "professional_certifications" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "authority" TEXT NOT NULL,
  "expires" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_skills
CREATE TABLE IF NOT EXISTS "professional_skills" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "level" TEXT DEFAULT 'intermediate',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_preferences
CREATE TABLE IF NOT EXISTS "professional_preferences" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "empTypes" TEXT,
  "workArrangement" TEXT,
  "telehealth" BOOLEAN DEFAULT false,
  "minSalary" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_documents
CREATE TABLE IF NOT EXISTS "professional_documents" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "size" INTEGER,
  "status" TEXT DEFAULT 'uploaded',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- professional_job_alerts
CREATE TABLE IF NOT EXISTS "professional_job_alerts" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "title" TEXT,
  "state" TEXT,
  "category" TEXT,
  "frequency" TEXT DEFAULT 'instant',
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- workforce_job_matches
CREATE TABLE IF NOT EXISTS "workforce_job_matches" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "jobId" TEXT NOT NULL REFERENCES "JobPosting"("id") ON DELETE CASCADE,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "score" INTEGER NOT NULL,
  "level" TEXT NOT NULL,
  "matchedCriteria" TEXT,
  "missingCriteria" TEXT,
  "disqualifyingCriteria" TEXT,
  "status" TEXT NOT NULL DEFAULT 'generated',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN DEFAULT false,
  "link" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- notification_preferences
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "matches" TEXT DEFAULT 'in_app',
  "applications" TEXT DEFAULT 'in_app',
  "interests" TEXT DEFAULT 'in_app',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE "workforce_professional_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_social_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_employment_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_education" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_licenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_certifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professional_job_alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workforce_job_matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;

-- Drop existing if any
DROP POLICY IF EXISTS "Allow public read profiles" ON "workforce_professional_profiles";
DROP POLICY IF EXISTS "Allow public write profiles" ON "workforce_professional_profiles";
DROP POLICY IF EXISTS "Allow public update profiles" ON "workforce_professional_profiles";

-- Policies
CREATE POLICY "Allow public read profiles" ON "workforce_professional_profiles" FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert profiles" ON "workforce_professional_profiles" FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON "workforce_professional_profiles" FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public access social" ON "professional_social_links" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access history" ON "professional_employment_history" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access education" ON "professional_education" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access licenses" ON "professional_licenses" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access certifications" ON "professional_certifications" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access skills" ON "professional_skills" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access preferences" ON "professional_preferences" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access documents" ON "professional_documents" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access alerts" ON "professional_job_alerts" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access matches" ON "workforce_job_matches" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access notifications" ON "notifications" FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access preferences_notify" ON "notification_preferences" FOR ALL TO public USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_wpp_email" ON "workforce_professional_profiles"("email");
CREATE INDEX IF NOT EXISTS "idx_wpp_status" ON "workforce_professional_profiles"("status");
CREATE INDEX IF NOT EXISTS "idx_wjm_job" ON "workforce_job_matches"("jobId");
CREATE INDEX IF NOT EXISTS "idx_wjm_profile" ON "workforce_job_matches"("profileId");
