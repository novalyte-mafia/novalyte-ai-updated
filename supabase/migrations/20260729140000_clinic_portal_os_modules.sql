-- Clinic portal OS: CRM depth, patients/calendar, billing/audit shells.
-- All tables keyed by organization_id and/or clinic_id with RLS via is_org_member.

-- Phase 2: lead notes, tasks, stage history
CREATE TABLE IF NOT EXISTS public.clinic_lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.lead_assignments(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.patient_leads(id) ON DELETE CASCADE,
  author_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinic_lead_notes_assignment_idx ON public.clinic_lead_notes (assignment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS clinic_lead_notes_org_idx ON public.clinic_lead_notes (organization_id);

CREATE TABLE IF NOT EXISTS public.clinic_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  assignment_id uuid NULL REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  lead_id uuid NULL REFERENCES public.patient_leads(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
  due_at timestamptz NULL,
  assigned_to_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinic_tasks_org_due_idx ON public.clinic_tasks (organization_id, status, due_at);
CREATE INDEX IF NOT EXISTS clinic_tasks_assignment_idx ON public.clinic_tasks (assignment_id);

CREATE TABLE IF NOT EXISTS public.clinic_lead_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.lead_assignments(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.patient_leads(id) ON DELETE CASCADE,
  from_status text NULL,
  to_status text NOT NULL,
  changed_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinic_lead_stage_history_assignment_idx
  ON public.clinic_lead_stage_history (assignment_id, created_at DESC);

-- Phase 3: appointments + document metadata
CREATE TABLE IF NOT EXISTS public.clinic_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  assignment_id uuid NULL REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  lead_id uuid NULL REFERENCES public.patient_leads(id) ON DELETE SET NULL,
  title text NOT NULL,
  notes text NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NULL,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinic_appointments_clinic_starts_idx
  ON public.clinic_appointments (clinic_id, starts_at);

CREATE TABLE IF NOT EXISTS public.clinic_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  lead_id uuid NULL REFERENCES public.patient_leads(id) ON DELETE SET NULL,
  assignment_id uuid NULL REFERENCES public.lead_assignments(id) ON DELETE SET NULL,
  title text NOT NULL,
  storage_path text NULL,
  mime_type text NULL,
  bytes bigint NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 5–6: marketplace orders, subscriptions, audit
CREATE TABLE IF NOT EXISTS public.clinic_marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NULL REFERENCES public."Clinic"(id) ON DELETE SET NULL,
  sku_slug text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'quote_requested'
    CHECK (status IN ('quote_requested', 'quoted', 'ordered', 'fulfilled', 'cancelled')),
  notes text NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinic_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  plan_key text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  stripe_customer_id text NULL,
  stripe_subscription_id text NULL,
  current_period_end timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS public.clinic_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NULL REFERENCES public.employer_organizations(id) ON DELETE SET NULL,
  clinic_id text NULL,
  actor_user_id uuid NULL,
  actor_kind text NOT NULL DEFAULT 'clinic_user'
    CHECK (actor_kind IN ('clinic_user', 'novalyte_admin', 'system')),
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinic_audit_events_org_idx ON public.clinic_audit_events (organization_id, created_at DESC);

-- Admin "view as clinic" sessions (service-role / admin HQ only; never readable by clinic JWT)
CREATE TABLE IF NOT EXISTS public.clinic_admin_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  clinic_id text NULL REFERENCES public."Clinic"(id) ON DELETE SET NULL,
  reason text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  audit_note text NULL
);

ALTER TABLE public.clinic_lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_lead_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Org members can read/write operational CRM tables (APIs still use service-role + membership checks).
DROP POLICY IF EXISTS clinic_lead_notes_org_rw ON public.clinic_lead_notes;
CREATE POLICY clinic_lead_notes_org_rw ON public.clinic_lead_notes
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[]));

DROP POLICY IF EXISTS clinic_tasks_org_rw ON public.clinic_tasks;
CREATE POLICY clinic_tasks_org_rw ON public.clinic_tasks
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[]));

DROP POLICY IF EXISTS clinic_lead_stage_history_org_r ON public.clinic_lead_stage_history;
CREATE POLICY clinic_lead_stage_history_org_r ON public.clinic_lead_stage_history
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]));

DROP POLICY IF EXISTS clinic_appointments_org_rw ON public.clinic_appointments;
CREATE POLICY clinic_appointments_org_rw ON public.clinic_appointments
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[]));

DROP POLICY IF EXISTS clinic_documents_org_rw ON public.clinic_documents;
CREATE POLICY clinic_documents_org_rw ON public.clinic_documents
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[]));

DROP POLICY IF EXISTS clinic_marketplace_orders_org_rw ON public.clinic_marketplace_orders;
CREATE POLICY clinic_marketplace_orders_org_rw ON public.clinic_marketplace_orders
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[]))
  WITH CHECK (public.is_org_member(organization_id, ARRAY['owner','admin','recruiter']::text[]));

DROP POLICY IF EXISTS clinic_subscriptions_org_r ON public.clinic_subscriptions;
CREATE POLICY clinic_subscriptions_org_r ON public.clinic_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, ARRAY['owner','admin']::text[]));

DROP POLICY IF EXISTS clinic_audit_events_org_r ON public.clinic_audit_events;
CREATE POLICY clinic_audit_events_org_r ON public.clinic_audit_events
  FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner','admin']::text[])
  );

-- Impersonation table: no authenticated policies (admin service-role only).
REVOKE ALL ON public.clinic_admin_impersonation_sessions FROM authenticated, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_lead_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_tasks TO authenticated;
GRANT SELECT ON public.clinic_lead_stage_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_marketplace_orders TO authenticated;
GRANT SELECT ON public.clinic_subscriptions TO authenticated;
GRANT SELECT ON public.clinic_audit_events TO authenticated;
