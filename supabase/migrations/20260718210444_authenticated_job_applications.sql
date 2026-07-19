-- Authenticated job applications linked to workforce profiles.

ALTER TABLE public."JobApplication"
  ADD COLUMN IF NOT EXISTS applicant_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workforce_profile_id text REFERENCES public.workforce_professional_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.employer_organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz,
  ADD COLUMN IF NOT EXISTS application_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS job_application_job_profile_unique
  ON public."JobApplication" ("jobPostingId", workforce_profile_id)
  WHERE workforce_profile_id IS NOT NULL AND withdrawn_at IS NULL;

CREATE INDEX IF NOT EXISTS job_application_workforce_profile_idx
  ON public."JobApplication" (workforce_profile_id);
CREATE INDEX IF NOT EXISTS job_application_applicant_user_idx
  ON public."JobApplication" (applicant_user_id);
CREATE INDEX IF NOT EXISTS job_application_organization_idx
  ON public."JobApplication" (organization_id);

-- Remove anonymous insert path.
DROP POLICY IF EXISTS "Allow public insert job applications" ON public."JobApplication";

DROP POLICY IF EXISTS "Applicant can read own applications" ON public."JobApplication";
CREATE POLICY "Applicant can read own applications"
  ON public."JobApplication" FOR SELECT TO authenticated
  USING (applicant_user_id = auth.uid());

DROP POLICY IF EXISTS "Applicant can withdraw own applications" ON public."JobApplication";
CREATE POLICY "Applicant can withdraw own applications"
  ON public."JobApplication" FOR UPDATE TO authenticated
  USING (applicant_user_id = auth.uid())
  WITH CHECK (applicant_user_id = auth.uid());

DROP POLICY IF EXISTS "Org recruiters read applications" ON public."JobApplication";
CREATE POLICY "Org recruiters read applications"
  ON public."JobApplication" FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin', 'recruiter'])
  );

DROP POLICY IF EXISTS "Org recruiters update application status" ON public."JobApplication";
CREATE POLICY "Org recruiters update application status"
  ON public."JobApplication" FOR UPDATE TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin', 'recruiter'])
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin', 'recruiter'])
  );

-- Inserts go through authenticated server routes using service role.
GRANT SELECT, UPDATE ON public."JobApplication" TO authenticated;
GRANT ALL ON public."JobApplication" TO service_role;
