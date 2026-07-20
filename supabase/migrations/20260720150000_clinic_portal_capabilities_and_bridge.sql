-- Portal capabilities, expanded lead workflow statuses, notification RLS, assessment bridge helpers.

ALTER TABLE public.organization_memberships
  ADD COLUMN IF NOT EXISTS portal_capabilities jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.organization_memberships.portal_capabilities IS
  'Optional clinic portal flags, e.g. {"marketplace":true,"leads_readonly":true}';

-- Expand lead_assignments status check for clinic workflow (keep existing values).
ALTER TABLE public.lead_assignments DROP CONSTRAINT IF EXISTS lead_assignments_status_check;
ALTER TABLE public.lead_assignments
  ADD CONSTRAINT lead_assignments_status_check
  CHECK (status IN (
    'pending', 'delivered', 'viewed', 'accepted', 'contacted', 'declined', 'expired', 'booked'
  ));

-- Org members can read their invitations (service-role still used by portal APIs).
DROP POLICY IF EXISTS portal_invitations_select_org_member ON public.portal_invitations;
CREATE POLICY portal_invitations_select_org_member
  ON public.portal_invitations
  FOR SELECT
  TO authenticated
  USING (
    public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
  );

DROP POLICY IF EXISTS portal_notifications_select_own ON public.portal_notifications;
CREATE POLICY portal_notifications_select_own
  ON public.portal_notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );

DROP POLICY IF EXISTS portal_notifications_update_own ON public.portal_notifications;
CREATE POLICY portal_notifications_update_own
  ON public.portal_notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT ON public.portal_invitations TO authenticated;
GRANT SELECT, UPDATE ON public.portal_notifications TO authenticated;

-- Promote AssessmentSubmission → patient_leads (service-role / admin only).
CREATE OR REPLACE FUNCTION public.promote_assessment_to_patient_lead(p_assessment_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public."AssessmentSubmission"%ROWTYPE;
  v_lead_id uuid;
BEGIN
  SELECT * INTO v_row
  FROM public."AssessmentSubmission"
  WHERE id = p_assessment_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found: %', p_assessment_id;
  END IF;

  SELECT id INTO v_lead_id
  FROM public.patient_leads
  WHERE assessment_id = p_assessment_id
  LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    RETURN v_lead_id;
  END IF;

  INSERT INTO public.patient_leads (
    source,
    assessment_id,
    first_name,
    last_name,
    email,
    phone,
    state,
    zip,
    treatment_interest,
    symptoms,
    concerns,
    assessment_payload,
    preferred_contact,
    best_time,
    telehealth_preference,
    consent_contact,
    consent_sms,
    status,
    lead_source,
    source_page
  )
  VALUES (
    'assessment',
    p_assessment_id,
    COALESCE(NULLIF(v_row."firstName", ''), 'Patient'),
    COALESCE(v_row."lastName", ''),
    v_row.email,
    v_row.phone,
    v_row."locationState",
    v_row.zip,
    v_row."treatmentInterest",
    v_row.symptoms,
    v_row.concerns,
    to_jsonb(v_row),
    v_row."preferredContact",
    v_row."bestTime",
    CASE WHEN v_row."telehealthPref" THEN 'telehealth' ELSE NULL END,
    COALESCE(v_row."consentContact", false),
    COALESCE(v_row."consentSms", false),
    'qualified',
    'assessment',
    COALESCE(v_row."sourcePage", 'assessment')
  )
  RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_consultation_to_patient_lead(p_consultation_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public."ConsultationRequest"%ROWTYPE;
  v_lead_id uuid;
  v_first text;
  v_last text;
BEGIN
  SELECT * INTO v_row
  FROM public."ConsultationRequest"
  WHERE id = p_consultation_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Consultation not found: %', p_consultation_id;
  END IF;

  SELECT id INTO v_lead_id
  FROM public.patient_leads
  WHERE consultation_id = p_consultation_id
  LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    RETURN v_lead_id;
  END IF;

  v_first := COALESCE(NULLIF(split_part(COALESCE(v_row."patientName", ''), ' ', 1), ''), 'Patient');
  v_last := NULLIF(trim(substring(COALESCE(v_row."patientName", '') from length(v_first) + 1)), '');

  INSERT INTO public.patient_leads (
    source,
    consultation_id,
    first_name,
    last_name,
    email,
    phone,
    treatment_interest,
    notes,
    assessment_payload,
    best_time,
    consent_contact,
    status,
    lead_source,
    source_page
  )
  VALUES (
    'consultation',
    p_consultation_id,
    v_first,
    COALESCE(v_last, ''),
    v_row."patientEmail",
    v_row."patientPhone",
    v_row."treatmentInterest",
    v_row.notes,
    to_jsonb(v_row),
    v_row."preferredTime",
    true,
    'qualified',
    'consultation',
    'consultation'
  )
  RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_assessment_to_patient_lead(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.promote_consultation_to_patient_lead(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_assessment_to_patient_lead(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_consultation_to_patient_lead(text) TO service_role;
