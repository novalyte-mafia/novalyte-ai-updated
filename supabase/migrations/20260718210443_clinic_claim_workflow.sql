-- Clinic claim workflow: pending review, admin-verified org link. Prospects stay private.

ALTER TABLE public."Clinic"
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.employer_organizations(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.clinic_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id text NOT NULL REFERENCES public."Clinic"(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  claimant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'revoked')),
  authorized boolean NOT NULL DEFAULT false,
  attestation_version text NOT NULL DEFAULT 'v1',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewer_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS clinic_claims_one_active_approved
  ON public.clinic_claims (clinic_id)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS clinic_claims_org_idx ON public.clinic_claims (organization_id);
CREATE INDEX IF NOT EXISTS clinic_claims_status_idx ON public.clinic_claims (status);

ALTER TABLE public.clinic_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Claimants and org admins read claims" ON public.clinic_claims;
CREATE POLICY "Claimants and org admins read claims"
  ON public.clinic_claims FOR SELECT TO authenticated
  USING (
    claimant_user_id = auth.uid()
    OR public.is_org_member(organization_id, ARRAY['owner', 'admin'])
  );

DROP POLICY IF EXISTS "Org owners admins submit claims" ON public.clinic_claims;
CREATE POLICY "Org owners admins submit claims"
  ON public.clinic_claims FOR INSERT TO authenticated
  WITH CHECK (
    claimant_user_id = auth.uid()
    AND public.is_org_member(organization_id, ARRAY['owner', 'admin'])
    AND status IN ('submitted', 'under_review')
  );

-- Members cannot self-approve.
DROP POLICY IF EXISTS "Members cannot update claim status" ON public.clinic_claims;
CREATE POLICY "Claimants can update non-terminal evidence"
  ON public.clinic_claims FOR UPDATE TO authenticated
  USING (
    claimant_user_id = auth.uid()
    AND status IN ('submitted', 'under_review')
  )
  WITH CHECK (
    claimant_user_id = auth.uid()
    AND status IN ('submitted', 'under_review')
  );

CREATE OR REPLACE FUNCTION public.admin_review_clinic_claim(
  p_claim_id uuid,
  p_action text,
  p_notes text DEFAULT NULL,
  p_reviewer text DEFAULT NULL
)
RETURNS public.clinic_claims
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claim public.clinic_claims;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'admin_review_clinic_claim requires service_role';
  END IF;

  IF p_action NOT IN ('approve', 'reject', 'revoke') THEN
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  SELECT * INTO claim FROM public.clinic_claims WHERE id = p_claim_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;

  IF p_action = 'approve' THEN
    UPDATE public.clinic_claims
    SET status = 'approved',
        reviewer_notes = p_notes,
        reviewed_by = p_reviewer,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_claim_id
    RETURNING * INTO claim;

    UPDATE public."Clinic"
    SET organization_id = claim.organization_id,
        "claimStatus" = 'claimed',
        "updatedAt" = now()
    WHERE id = claim.clinic_id;

    UPDATE public.employer_organizations
    SET verification_status = 'verified',
        lifecycle_status = 'active',
        updated_at = now()
    WHERE id = claim.organization_id;

  ELSIF p_action = 'reject' THEN
    UPDATE public.clinic_claims
    SET status = 'rejected',
        reviewer_notes = p_notes,
        reviewed_by = p_reviewer,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_claim_id
    RETURNING * INTO claim;

  ELSE
    UPDATE public.clinic_claims
    SET status = 'revoked',
        reviewer_notes = p_notes,
        reviewed_by = p_reviewer,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_claim_id
    RETURNING * INTO claim;

    UPDATE public."Clinic"
    SET organization_id = NULL,
        "claimStatus" = 'unclaimed',
        "updatedAt" = now()
    WHERE id = claim.clinic_id
      AND organization_id = claim.organization_id;
  END IF;

  RETURN claim;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_clinic_claim(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_clinic_claim(uuid, text, text, text) TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.clinic_claims TO authenticated;
GRANT ALL ON public.clinic_claims TO service_role;
