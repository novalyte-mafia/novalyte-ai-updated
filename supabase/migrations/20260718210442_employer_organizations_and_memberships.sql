-- Employer organizations, memberships, and job ownership.

CREATE TABLE IF NOT EXISTS public.employer_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL,
  public_name text,
  slug text UNIQUE,
  org_type text,
  website text,
  hq_state text,
  location_count integer,
  org_size text,
  primary_specialty text,
  description text,
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  lifecycle_status text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle_status IN ('draft', 'active', 'suspended', 'closed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.employer_onboarding_drafts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0 CHECK (current_step BETWEEN 0 AND 5),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  organization_id uuid REFERENCES public.employer_organizations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_public_profiles (
  organization_id uuid PRIMARY KEY REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  public_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  org_type text,
  website text,
  hq_state text,
  primary_specialty text,
  description text,
  verified boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public."JobPosting"
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.employer_organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE INDEX IF NOT EXISTS job_posting_organization_id_idx
  ON public."JobPosting" (organization_id);

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid, p_roles text[] DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_memberships m
    WHERE m.organization_id = p_org_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND (p_roles IS NULL OR m.role = ANY (p_roles))
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_member(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, text[]) TO authenticated, service_role;

ALTER TABLE public.employer_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_onboarding_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read own organization" ON public.employer_organizations;
CREATE POLICY "Members can read own organization"
  ON public.employer_organizations FOR SELECT TO authenticated
  USING (public.is_org_member(id, NULL));

DROP POLICY IF EXISTS "Owners admins can update organization" ON public.employer_organizations;
CREATE POLICY "Owners admins can update organization"
  ON public.employer_organizations FOR UPDATE TO authenticated
  USING (public.is_org_member(id, ARRAY['owner', 'admin']))
  WITH CHECK (public.is_org_member(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Members can read memberships" ON public.organization_memberships;
CREATE POLICY "Members can read memberships"
  ON public.organization_memberships FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, NULL) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Owners admins manage memberships" ON public.organization_memberships;
CREATE POLICY "Owners admins manage memberships"
  ON public.organization_memberships FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Employer can read own onboarding draft" ON public.employer_onboarding_drafts;
CREATE POLICY "Employer can read own onboarding draft"
  ON public.employer_onboarding_drafts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public can read org public profiles" ON public.organization_public_profiles;
CREATE POLICY "Public can read org public profiles"
  ON public.organization_public_profiles FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL);

-- Job posting membership policies (additive; keep existing public browse of open jobs).
DROP POLICY IF EXISTS "Org recruiters manage jobs" ON public."JobPosting";
CREATE POLICY "Org recruiters manage jobs"
  ON public."JobPosting" FOR ALL TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin', 'recruiter'])
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin', 'recruiter'])
  );

GRANT SELECT, INSERT, UPDATE ON public.employer_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_memberships TO authenticated;
GRANT SELECT ON public.organization_public_profiles TO anon, authenticated;
GRANT SELECT ON public.employer_onboarding_drafts TO authenticated;
GRANT ALL ON public.employer_organizations TO service_role;
GRANT ALL ON public.organization_memberships TO service_role;
GRANT ALL ON public.employer_onboarding_drafts TO service_role;
GRANT ALL ON public.organization_public_profiles TO service_role;
