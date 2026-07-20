-- Clinic portal lead delivery: patient_leads + lead_assignments (tenant-scoped).

CREATE TABLE IF NOT EXISTS public.patient_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('assessment', 'consultation', 'manual', 'import', 'campaign')),
  assessment_id text NULL,
  consultation_id text NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NULL,
  phone text NULL,
  city text NULL,
  state text NULL,
  zip text NULL,
  treatment_interest text NULL,
  symptoms text NULL,
  concerns text NULL,
  assessment_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_contact text NULL,
  best_time text NULL,
  insurance_preference text NULL,
  telehealth_preference text NULL,
  consent_contact boolean NOT NULL DEFAULT false,
  consent_sms boolean NOT NULL DEFAULT false,
  qualification_score integer NULL,
  urgency_score integer NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'qualified', 'contacted', 'routed', 'booked', 'lost', 'disqualified', 'duplicate')),
  lead_source text NULL,
  campaign_source text NULL,
  source_page text NULL,
  notes text NULL,
  verified_at timestamptz NULL,
  verified_by text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS patient_leads_status_idx ON public.patient_leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS patient_leads_email_idx ON public.patient_leads (email);

CREATE TABLE IF NOT EXISTS public.lead_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.patient_leads(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  organization_id uuid NULL REFERENCES public.employer_organizations(id) ON DELETE SET NULL,
  assigned_by text NULL,
  status text NOT NULL DEFAULT 'delivered'
    CHECK (status IN ('pending', 'delivered', 'viewed', 'accepted', 'declined', 'expired', 'booked')),
  match_score numeric NULL,
  explanation text NULL,
  clinic_notes text NULL,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  viewed_at timestamptz NULL,
  responded_at timestamptz NULL,
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS lead_assignments_active_unique
  ON public.lead_assignments (lead_id, clinic_id)
  WHERE status NOT IN ('declined', 'expired');

CREATE INDEX IF NOT EXISTS lead_assignments_clinic_idx
  ON public.lead_assignments (clinic_id, status, delivered_at DESC);

CREATE INDEX IF NOT EXISTS lead_assignments_org_idx
  ON public.lead_assignments (organization_id, delivered_at DESC);

CREATE TABLE IF NOT EXISTS public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.patient_leads(id) ON DELETE CASCADE,
  assignment_id uuid NULL REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  actor text NULL,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_events_lead_idx ON public.lead_events (lead_id, created_at DESC);

ALTER TABLE public.patient_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Org members can read assignments for clinics linked to their organization.
DROP POLICY IF EXISTS lead_assignments_select_org_member ON public.lead_assignments;
CREATE POLICY lead_assignments_select_org_member
  ON public.lead_assignments
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
  );

DROP POLICY IF EXISTS lead_assignments_update_org_member ON public.lead_assignments;
CREATE POLICY lead_assignments_update_org_member
  ON public.lead_assignments
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[])
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[])
  );

DROP POLICY IF EXISTS patient_leads_select_via_assignment ON public.patient_leads;
CREATE POLICY patient_leads_select_via_assignment
  ON public.patient_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lead_assignments la
      WHERE la.lead_id = patient_leads.id
        AND la.organization_id IS NOT NULL
        AND public.is_org_member(la.organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );

DROP POLICY IF EXISTS lead_events_select_via_assignment ON public.lead_events;
CREATE POLICY lead_events_select_via_assignment
  ON public.lead_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lead_assignments la
      WHERE la.lead_id = lead_events.lead_id
        AND la.organization_id IS NOT NULL
        AND public.is_org_member(la.organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );

-- Service role / admin APIs handle inserts and routing (no anon insert).
REVOKE ALL ON public.patient_leads FROM PUBLIC, anon;
REVOKE ALL ON public.lead_assignments FROM PUBLIC, anon;
REVOKE ALL ON public.lead_events FROM PUBLIC, anon;
GRANT SELECT ON public.patient_leads TO authenticated;
GRANT SELECT, UPDATE ON public.lead_assignments TO authenticated;
GRANT SELECT ON public.lead_events TO authenticated;
GRANT ALL ON public.patient_leads TO service_role;
GRANT ALL ON public.lead_assignments TO service_role;
GRANT ALL ON public.lead_events TO service_role;

-- Optional logo column for clinic directory self-serve.
ALTER TABLE public."Clinic"
  ADD COLUMN IF NOT EXISTS "logoUrl" text;

COMMENT ON TABLE public.patient_leads IS 'Qualified patient opportunities for clinic portal delivery.';
COMMENT ON TABLE public.lead_assignments IS 'Tenant-scoped push of a lead to a specific clinic dashboard.';
