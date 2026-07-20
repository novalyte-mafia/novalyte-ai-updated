-- Org members can read their linked clinic graph in the portal.

DROP POLICY IF EXISTS clinic_select_org_member ON public."Clinic";
CREATE POLICY clinic_select_org_member
  ON public."Clinic"
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND public.is_org_member(organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
  );

DROP POLICY IF EXISTS clinic_location_select_org_member ON public."ClinicLocation";
CREATE POLICY clinic_location_select_org_member
  ON public."ClinicLocation"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Clinic" c
      WHERE c.id = "ClinicLocation"."clinicId"
        AND c.organization_id IS NOT NULL
        AND public.is_org_member(c.organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );

DROP POLICY IF EXISTS clinic_provider_select_org_member ON public."ClinicProvider";
CREATE POLICY clinic_provider_select_org_member
  ON public."ClinicProvider"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Clinic" c
      WHERE c.id = "ClinicProvider"."clinicId"
        AND c.organization_id IS NOT NULL
        AND public.is_org_member(c.organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );

DROP POLICY IF EXISTS clinic_treatment_select_org_member ON public."ClinicTreatment";
CREATE POLICY clinic_treatment_select_org_member
  ON public."ClinicTreatment"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Clinic" c
      WHERE c.id = "ClinicTreatment"."clinicId"
        AND c.organization_id IS NOT NULL
        AND public.is_org_member(c.organization_id, ARRAY['owner','admin','recruiter','viewer']::text[])
    )
  );
