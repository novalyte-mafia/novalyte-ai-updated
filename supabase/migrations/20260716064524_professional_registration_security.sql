ALTER TABLE public.workforce_professional_profiles
  ADD COLUMN IF NOT EXISTS visibility_status text NOT NULL DEFAULT 'private';
ALTER TABLE public.workforce_professional_profiles
  DROP CONSTRAINT IF EXISTS workforce_professional_profiles_visibility_status_check;
ALTER TABLE public.workforce_professional_profiles
  ADD CONSTRAINT workforce_professional_profiles_visibility_status_check
  CHECK (visibility_status IN ('private', 'discoverable'));

CREATE OR REPLACE FUNCTION public.protect_professional_lifecycle_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND (
       NEW."userId" IS DISTINCT FROM OLD."userId"
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.review_status IS DISTINCT FROM OLD.review_status
       OR NEW.onboarding_completed_at IS DISTINCT FROM OLD.onboarding_completed_at
     ) THEN
    RAISE EXCEPTION 'Professional lifecycle fields can only be changed by the server';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_professional_lifecycle_fields ON public.workforce_professional_profiles;
CREATE TRIGGER protect_professional_lifecycle_fields
  BEFORE UPDATE ON public.workforce_professional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_professional_lifecycle_fields();

REVOKE ALL ON FUNCTION public.protect_professional_lifecycle_fields() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_profile_owner(p_profile_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workforce_professional_profiles
    WHERE id = p_profile_id AND "userId" = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_profile_owner(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_profile_owner(text) TO authenticated;

ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Professional can read own profile" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Public can read approved professional profiles" ON public.workforce_professional_profiles;
CREATE POLICY "Professional can read permitted profiles"
  ON public.workforce_professional_profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = "userId"
    OR (review_status = 'approved' AND status = 'active' AND visibility_status = 'discoverable')
  );
CREATE POLICY "Public can read approved professional profiles"
  ON public.workforce_professional_profiles FOR SELECT TO anon
  USING (review_status = 'approved' AND status = 'active' AND visibility_status = 'discoverable');

DROP POLICY IF EXISTS "Allow public insert professional onboarding" ON public."ProfessionalOnboarding";

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'professional_social_links',
    'professional_employment_history',
    'professional_education',
    'professional_licenses',
    'professional_certifications',
    'professional_skills',
    'professional_preferences',
    'professional_documents',
    'professional_job_alerts',
    'saved_jobs',
    'notifications',
    'notification_preferences'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      CASE table_name
        WHEN 'professional_social_links' THEN 'Allow owner to select social'
        WHEN 'professional_employment_history' THEN 'Allow owner to select history'
        WHEN 'professional_education' THEN 'Allow owner to select education'
        WHEN 'professional_licenses' THEN 'Allow owner to select licenses'
        WHEN 'professional_certifications' THEN 'Allow owner to select certifications'
        WHEN 'professional_skills' THEN 'Allow owner to select skills'
        WHEN 'professional_preferences' THEN 'Allow owner to select preferences'
        WHEN 'professional_documents' THEN 'Allow owner to select documents'
        WHEN 'professional_job_alerts' THEN 'Allow owner to select alerts'
        WHEN 'saved_jobs' THEN 'Allow owner to select saved jobs'
        WHEN 'notifications' THEN 'Allow owner to select notifications'
        WHEN 'notification_preferences' THEN 'Allow owner to select notification preferences'
      END,
      table_name
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      CASE table_name
        WHEN 'professional_social_links' THEN 'Allow owner to manage social'
        WHEN 'professional_employment_history' THEN 'Allow owner to manage history'
        WHEN 'professional_education' THEN 'Allow owner to manage education'
        WHEN 'professional_licenses' THEN 'Allow owner to manage licenses'
        WHEN 'professional_certifications' THEN 'Allow owner to manage certifications'
        WHEN 'professional_skills' THEN 'Allow owner to manage skills'
        WHEN 'professional_preferences' THEN 'Allow owner to manage preferences'
        WHEN 'professional_documents' THEN 'Allow owner to manage documents'
        WHEN 'professional_job_alerts' THEN 'Allow owner to manage alerts'
        WHEN 'saved_jobs' THEN 'Allow owner to manage saved jobs'
        WHEN 'notifications' THEN 'Allow owner to manage notifications'
        WHEN 'notification_preferences' THEN 'Allow owner to manage notification preferences'
      END,
      table_name
    );
    EXECUTE format(
      'CREATE POLICY "Professional owns row" ON public.%I FOR ALL TO authenticated USING (public.is_profile_owner("profileId")) WITH CHECK (public.is_profile_owner("profileId"))',
      table_name
    );
  END LOOP;
END;
$$;

CREATE POLICY "Professional can read own matches"
  ON public.workforce_job_matches FOR SELECT TO authenticated
  USING (public.is_profile_owner("profileId"));
;
