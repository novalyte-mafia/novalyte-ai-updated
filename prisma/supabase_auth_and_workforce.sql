-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users("id") ON DELETE CASCADE,
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'professional',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create the trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'professional')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    "updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Alter workforce_professional_profiles to add userId reference
ALTER TABLE "workforce_professional_profiles" 
ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users("id") ON DELETE CASCADE;

-- 4. Create saved_jobs table
CREATE TABLE IF NOT EXISTS "saved_jobs" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "profileId" TEXT NOT NULL REFERENCES "workforce_professional_profiles"("id") ON DELETE CASCADE,
  "jobId" TEXT NOT NULL REFERENCES "JobPosting"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE("profileId", "jobId")
);

-- 5. Enable Row-Level Security
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_jobs" ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow users to read own profile" ON "profiles";
DROP POLICY IF EXISTS "Allow users to update own profile" ON "profiles";
DROP POLICY IF EXISTS "Allow users to select own workforce profile" ON "workforce_professional_profiles";
DROP POLICY IF EXISTS "Allow users to insert own workforce profile" ON "workforce_professional_profiles";
DROP POLICY IF EXISTS "Allow users to update own workforce profile" ON "workforce_professional_profiles";
DROP POLICY IF EXISTS "Allow users to select own saved jobs" ON "saved_jobs";
DROP POLICY IF EXISTS "Allow users to manage own saved jobs" ON "saved_jobs";

-- 7. Define RLS Policies for Profiles
CREATE POLICY "Allow users to read own profile" ON "profiles"
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON "profiles"
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 8. Define RLS Policies for workforce_professional_profiles
CREATE POLICY "Allow users to select own workforce profile" ON "workforce_professional_profiles"
  FOR SELECT USING (
    (auth.uid() = "userId") OR 
    (status = 'profile_published')
  );

CREATE POLICY "Allow users to insert own workforce profile" ON "workforce_professional_profiles"
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR "userId" IS NULL);

CREATE POLICY "Allow users to update own workforce profile" ON "workforce_professional_profiles"
  FOR UPDATE USING (auth.uid() = "userId");

-- 9. Define RLS Policies for professional related tables (joining on profileId)
CREATE OR REPLACE FUNCTION public.is_profile_owner(p_profile_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workforce_professional_profiles
    WHERE id = p_profile_id AND "userId" = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies for child tables
DROP POLICY IF EXISTS "Allow owner to select social" ON "professional_social_links";
DROP POLICY IF EXISTS "Allow owner to manage social" ON "professional_social_links";
CREATE POLICY "Allow owner to select social" ON "professional_social_links" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage social" ON "professional_social_links" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select history" ON "professional_employment_history";
DROP POLICY IF EXISTS "Allow owner to manage history" ON "professional_employment_history";
CREATE POLICY "Allow owner to select history" ON "professional_employment_history" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage history" ON "professional_employment_history" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select education" ON "professional_education";
DROP POLICY IF EXISTS "Allow owner to manage education" ON "professional_education";
CREATE POLICY "Allow owner to select education" ON "professional_education" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage education" ON "professional_education" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select licenses" ON "professional_licenses";
DROP POLICY IF EXISTS "Allow owner to manage licenses" ON "professional_licenses";
CREATE POLICY "Allow owner to select licenses" ON "professional_licenses" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage licenses" ON "professional_licenses" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select certifications" ON "professional_certifications";
DROP POLICY IF EXISTS "Allow owner to manage certifications" ON "professional_certifications";
CREATE POLICY "Allow owner to select certifications" ON "professional_certifications" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage certifications" ON "professional_certifications" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select skills" ON "professional_skills";
DROP POLICY IF EXISTS "Allow owner to manage skills" ON "professional_skills";
CREATE POLICY "Allow owner to select skills" ON "professional_skills" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage skills" ON "professional_skills" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select preferences" ON "professional_preferences";
DROP POLICY IF EXISTS "Allow owner to manage preferences" ON "professional_preferences";
CREATE POLICY "Allow owner to select preferences" ON "professional_preferences" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage preferences" ON "professional_preferences" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select documents" ON "professional_documents";
DROP POLICY IF EXISTS "Allow owner to manage documents" ON "professional_documents";
CREATE POLICY "Allow owner to select documents" ON "professional_documents" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage documents" ON "professional_documents" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select alerts" ON "professional_job_alerts";
DROP POLICY IF EXISTS "Allow owner to manage alerts" ON "professional_job_alerts";
CREATE POLICY "Allow owner to select alerts" ON "professional_job_alerts" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage alerts" ON "professional_job_alerts" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select saved jobs" ON "saved_jobs";
DROP POLICY IF EXISTS "Allow owner to manage saved jobs" ON "saved_jobs";
CREATE POLICY "Allow owner to select saved jobs" ON "saved_jobs" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage saved jobs" ON "saved_jobs" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select notifications" ON "notifications";
DROP POLICY IF EXISTS "Allow owner to manage notifications" ON "notifications";
CREATE POLICY "Allow owner to select notifications" ON "notifications" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage notifications" ON "notifications" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

DROP POLICY IF EXISTS "Allow owner to select notification preferences" ON "notification_preferences";
DROP POLICY IF EXISTS "Allow owner to manage notification preferences" ON "notification_preferences";
CREATE POLICY "Allow owner to select notification preferences" ON "notification_preferences" FOR SELECT USING (is_profile_owner("profileId"));
CREATE POLICY "Allow owner to manage notification preferences" ON "notification_preferences" FOR ALL USING (is_profile_owner("profileId")) WITH CHECK (is_profile_owner("profileId"));

-- 10. Provision storage buckets and policies
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('professional-avatars', 'professional-avatars', true),
  ('professional-resumes', 'professional-resumes', false),
  ('professional-credentials', 'professional-credentials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage objects
DROP POLICY IF EXISTS "Allow public read avatars" ON storage.objects;
CREATE POLICY "Allow public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'professional-avatars');

DROP POLICY IF EXISTS "Allow users to manage own storage files" ON storage.objects;
CREATE POLICY "Allow users to manage own storage files" ON storage.objects
  FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
