-- Investor portal: access requests, grants, data room, metrics, fundraising, activity.
-- Authoritative roles live in auth.users.raw_app_meta_data.account_types.

-- Extend protected account types for investor portal.
CREATE OR REPLACE FUNCTION public.grant_account_type(p_user_id uuid, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_types jsonb;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'grant_account_type requires service_role';
  END IF;

  IF p_type NOT IN (
    'professional', 'employer', 'admin', 'professional_reviewer', 'organization_reviewer',
    'founder_admin', 'investor_pending', 'investor_approved', 'advisor', 'internal_team'
  ) THEN
    RAISE EXCEPTION 'Unsupported account type: %', p_type;
  END IF;

  SELECT COALESCE(raw_app_meta_data->'account_types', '[]'::jsonb)
  INTO current_types
  FROM auth.users
  WHERE id = p_user_id;

  IF current_types IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  IF NOT (current_types ? p_type) THEN
    current_types := current_types || jsonb_build_array(p_type);
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('account_types', current_types)
  WHERE id = p_user_id;

  UPDATE public.profiles
  SET role = CASE
        WHEN p_type IN ('professional', 'employer') THEN p_type
        ELSE role
      END,
      "updatedAt" = now()
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_account_type(p_user_id uuid, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_types jsonb;
  next_types jsonb;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'revoke_account_type requires service_role';
  END IF;

  SELECT COALESCE(raw_app_meta_data->'account_types', '[]'::jsonb)
  INTO current_types
  FROM auth.users
  WHERE id = p_user_id;

  IF current_types IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  SELECT COALESCE(jsonb_agg(value), '[]'::jsonb)
  INTO next_types
  FROM jsonb_array_elements_text(current_types) AS value
  WHERE value <> p_type;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('account_types', next_types)
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_account_type(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_account_type(uuid, text) TO service_role;

-- Access requests (public submit via service role only)
CREATE TABLE IF NOT EXISTS public.investor_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  work_email text NOT NULL,
  firm text,
  role_title text,
  investor_type text NOT NULL CHECK (investor_type IN (
    'angel', 'venture_capital', 'family_office', 'strategic', 'healthcare_operator',
    'corporate_venture', 'syndicate', 'advisor', 'other'
  )),
  check_size_range text,
  investment_stage_preference text,
  portfolio_companies text,
  linkedin_url text,
  website text,
  reason_for_interest text NOT NULL,
  discovery_source text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'denied', 'withdrawn'
  )),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS investor_access_requests_email_pending_idx
  ON public.investor_access_requests (lower(work_email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS investor_access_requests_status_idx
  ON public.investor_access_requests (status, created_at DESC);

-- Investor profiles (linked after approval)
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_request_id uuid REFERENCES public.investor_access_requests(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  work_email text NOT NULL,
  firm text,
  role_title text,
  investor_type text,
  stage text NOT NULL DEFAULT 'access_approved' CHECK (stage IN (
    'identified', 'contacted', 'interested', 'access_requested', 'access_approved',
    'meeting_scheduled', 'due_diligence', 'follow_up', 'passed', 'committed', 'closed'
  )),
  check_size_range text,
  linkedin_url text,
  website text,
  access_status text NOT NULL DEFAULT 'approved' CHECK (access_status IN (
    'pending', 'approved', 'revoked', 'denied'
  )),
  scopes text[] NOT NULL DEFAULT ARRAY['overview','product','market','technology','business_model','gtm','traction','roadmap','data_room','financials','updates']::text[],
  terms_accepted_at timestamptz,
  terms_version text,
  last_login_at timestamptz,
  follow_up_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS investor_profiles_access_status_idx
  ON public.investor_profiles (access_status) WHERE deleted_at IS NULL;

-- Invitations
CREATE TABLE IF NOT EXISTS public.investor_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_request_id uuid REFERENCES public.investor_access_requests(id) ON DELETE SET NULL,
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_invitations_email_idx
  ON public.investor_invitations (lower(email));

-- Access terms
CREATE TABLE IF NOT EXISTS public.investor_terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  title text NOT NULL,
  body_markdown text NOT NULL,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id uuid NOT NULL REFERENCES public.investor_terms_versions(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  UNIQUE (user_id, terms_version_id)
);

-- Content sections (draft/publish)
CREATE TABLE IF NOT EXISTS public.investor_content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body_markdown text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'draft' CHECK (visibility IN (
    'draft', 'public', 'approved_investors', 'specific_investors', 'internal'
  )),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Traction / company metrics
CREATE TABLE IF NOT EXISTS public.investor_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  value_numeric numeric,
  value_text text,
  unit text,
  period_label text,
  source text,
  status text NOT NULL DEFAULT 'Pending validation' CHECK (status IN (
    'Actual', 'Estimated', 'Projected', 'Target', 'Under development',
    'Planned', 'Founder-provided', 'Pending validation'
  )),
  visibility text NOT NULL DEFAULT 'approved_investors' CHECK (visibility IN (
    'public', 'approved_investors', 'internal', 'draft'
  )),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fundraising
CREATE TABLE IF NOT EXISTS public.investor_fundraising_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text,
  target_raise_cents bigint,
  minimum_check_cents bigint,
  instrument_type text,
  valuation_cap_cents bigint,
  discount_percent numeric,
  timeline text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  published_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_use_of_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.investor_fundraising_rounds(id) ON DELETE CASCADE,
  category text NOT NULL,
  percentage numeric,
  amount_cents bigint,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Financial scenarios (no invented seed values)
CREATE TABLE IF NOT EXISTS public.investor_financial_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scenario_type text NOT NULL CHECK (scenario_type IN ('conservative', 'base', 'upside')),
  assumptions_markdown text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_financial_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.investor_financial_scenarios(id) ON DELETE CASCADE,
  series_key text NOT NULL,
  period_label text NOT NULL,
  value_numeric numeric NOT NULL,
  unit text,
  UNIQUE (scenario_id, series_key, period_label)
);

-- Roadmap
CREATE TABLE IF NOT EXISTS public.investor_roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN (
    'completed', 'in_progress', 'planned', 'blocked', 'under_review'
  )),
  owner text,
  target_quarter text,
  dependencies text,
  business_impact text,
  required_capital text,
  visibility text NOT NULL DEFAULT 'approved_investors' CHECK (visibility IN (
    'public', 'approved_investors', 'internal', 'draft'
  )),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Data room documents
CREATE TABLE IF NOT EXISTS public.investor_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  visibility text NOT NULL DEFAULT 'approved_investors' CHECK (visibility IN (
    'approved_investors', 'specific_investors', 'internal', 'draft'
  )),
  featured boolean NOT NULL DEFAULT false,
  current_version_id uuid,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.investor_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.investor_documents(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  bucket_id text NOT NULL DEFAULT 'investor-data-room',
  object_path text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint,
  checksum text,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN (
    'pending', 'uploaded', 'pending_scan', 'approved', 'rejected', 'failed'
  )),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket_id, object_path)
);

ALTER TABLE public.investor_documents
  DROP CONSTRAINT IF EXISTS investor_documents_current_version_fk;
ALTER TABLE public.investor_documents
  ADD CONSTRAINT investor_documents_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES public.investor_document_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS investor_documents_category_idx
  ON public.investor_documents (category) WHERE deleted_at IS NULL;

-- Founder updates
CREATE TABLE IF NOT EXISTS public.investor_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  body_markdown text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'approved_investors' CHECK (visibility IN (
    'public', 'approved_investors', 'specific_investors', 'internal', 'draft'
  )),
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Meeting / contact
CREATE TABLE IF NOT EXISTS public.investor_meeting_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  firm text,
  email text NOT NULL,
  preferred_date text,
  timezone text,
  check_size_range text,
  investment_thesis text,
  topics text,
  message text NOT NULL,
  inquiry_type text NOT NULL DEFAULT 'meeting' CHECK (inquiry_type IN (
    'meeting', 'general', 'strategic_partnership', 'advisor', 'press'
  )),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notes + activity
CREATE TABLE IF NOT EXISTS public.investor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_profile_id uuid NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  investor_profile_id uuid REFERENCES public.investor_profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  section text,
  document_id uuid REFERENCES public.investor_documents(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_access_events_user_idx
  ON public.investor_access_events (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.investor_notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  recipient text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Private storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investor-data-room',
  'investor-data-room',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- No broad storage object policies for investor-data-room; access via service-role signed URLs only.
DROP POLICY IF EXISTS "investor_data_room_no_anon" ON storage.objects;

-- RLS
ALTER TABLE public.investor_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_terms_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_fundraising_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_use_of_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_financial_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_financial_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Deny-by-default for anon/authenticated; service role bypasses RLS.
-- Approved investors may read their own profile.
DROP POLICY IF EXISTS investor_profiles_select_own ON public.investor_profiles;
CREATE POLICY investor_profiles_select_own
  ON public.investor_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND access_status = 'approved'
    AND deleted_at IS NULL
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_terms_versions_select_published ON public.investor_terms_versions;
CREATE POLICY investor_terms_versions_select_published
  ON public.investor_terms_versions
  FOR SELECT
  TO authenticated
  USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS investor_terms_acceptances_select_own ON public.investor_terms_acceptances;
CREATE POLICY investor_terms_acceptances_select_own
  ON public.investor_terms_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS investor_content_public_select ON public.investor_content_sections;
CREATE POLICY investor_content_public_select
  ON public.investor_content_sections
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public');

DROP POLICY IF EXISTS investor_content_approved_select ON public.investor_content_sections;
CREATE POLICY investor_content_approved_select
  ON public.investor_content_sections
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'approved_investors'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_metrics_public_select ON public.investor_metrics;
CREATE POLICY investor_metrics_public_select
  ON public.investor_metrics
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public');

DROP POLICY IF EXISTS investor_metrics_approved_select ON public.investor_metrics;
CREATE POLICY investor_metrics_approved_select
  ON public.investor_metrics
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'approved_investors'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_roadmap_public_select ON public.investor_roadmap_items;
CREATE POLICY investor_roadmap_public_select
  ON public.investor_roadmap_items
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public');

DROP POLICY IF EXISTS investor_roadmap_approved_select ON public.investor_roadmap_items;
CREATE POLICY investor_roadmap_approved_select
  ON public.investor_roadmap_items
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'approved_investors'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_updates_public_select ON public.investor_updates;
CREATE POLICY investor_updates_public_select
  ON public.investor_updates
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public' AND published_at IS NOT NULL);

DROP POLICY IF EXISTS investor_updates_approved_select ON public.investor_updates;
CREATE POLICY investor_updates_approved_select
  ON public.investor_updates
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'approved_investors'
    AND published_at IS NOT NULL
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_fundraising_published_select ON public.investor_fundraising_rounds;
CREATE POLICY investor_fundraising_published_select
  ON public.investor_fundraising_rounds
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_financial_published_select ON public.investor_financial_scenarios;
CREATE POLICY investor_financial_published_select
  ON public.investor_financial_scenarios
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_documents_approved_select ON public.investor_documents;
CREATE POLICY investor_documents_approved_select
  ON public.investor_documents
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND visibility = 'approved_investors'
    AND public.has_account_type('investor_approved')
  );

DROP POLICY IF EXISTS investor_access_events_select_own ON public.investor_access_events;
CREATE POLICY investor_access_events_select_own
  ON public.investor_access_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Seed published access terms (attorney review placeholder)
INSERT INTO public.investor_terms_versions (version, title, body_markdown, published_at)
VALUES (
  '2026-07-21',
  'Investor Data Room Access Terms (Draft for Attorney Review)',
  $md$
# Investor Data Room Access Terms

**Status:** Draft for attorney review. Not final legal advice.

By requesting or accepting access to the Novalyte AI investor materials, you acknowledge that:

1. Materials may contain confidential and proprietary information.
2. You will not copy, share, or redistribute confidential materials without written permission.
3. Nothing on this portal constitutes an offer to sell or a solicitation to buy securities.
4. Forward-looking statements involve risks and uncertainties.
5. Past product development progress does not guarantee future results.
6. You will use the portal solely for evaluating a potential investment or strategic relationship.

Contact: founder@novalyte.io
$md$,
  now()
)
ON CONFLICT (version) DO NOTHING;

-- Seed public roadmap items reflecting shipped product (verified engineering status only)
INSERT INTO public.investor_roadmap_items (title, category, status, target_quarter, business_impact, visibility, sort_order)
VALUES
  ('Public website and brand platform', 'Public website', 'completed', '2026 Q2', 'Patient and clinic discovery surface', 'public', 10),
  ('Verified clinic directory foundation', 'Directory', 'in_progress', '2026 Q3', 'Clinic supply and patient matching', 'public', 20),
  ('Patient assessments and intent capture', 'Patient assessments', 'completed', '2026 Q3', 'Qualified patient routing', 'public', 30),
  ('Clinic portal (portal.novalyte.io)', 'Clinic onboarding', 'completed', '2026 Q3', 'Clinic operations workspace', 'public', 40),
  ('Admin command center', 'Command Center', 'completed', '2026 Q3', 'Founder-led GTM and operations', 'public', 50),
  ('Campaign Studio and landing pages', 'Demand intelligence', 'completed', '2026 Q3', 'Geo-targeted patient acquisition', 'public', 60),
  ('Workforce hub', 'Workforce', 'in_progress', '2026 Q3', 'Clinic hiring and talent supply', 'public', 70),
  ('Marketplace', 'Marketplace', 'in_progress', '2026 Q3', 'Healthcare commerce', 'public', 80),
  ('Investor portal', 'Investor portal', 'in_progress', '2026 Q3', 'Secure investor relations workspace', 'public', 90),
  ('Revenue activation with pilot clinics', 'Revenue activation', 'planned', '2026 Q4', 'Convert demonstrated value into paid relationships', 'public', 100)
ON CONFLICT DO NOTHING;
