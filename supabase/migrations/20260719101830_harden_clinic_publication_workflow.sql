-- Enforce an explicit, reviewable boundary between private prospect records
-- and public clinic listings. No imported prospect becomes public by default.

ALTER TABLE public.prospect_directory_profiles
  ADD COLUMN IF NOT EXISTS "publicClinicId" text
    REFERENCES public."Clinic"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "permissionSourceCallId" text
    REFERENCES public.prospect_calls(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "permissionGrantedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "approvedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "publishedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "suspendedAt" timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS prospect_directory_profiles_public_clinic_unique
  ON public.prospect_directory_profiles ("publicClinicId")
  WHERE "publicClinicId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS prospect_directory_profiles_publication_gate_idx
  ON public.prospect_directory_profiles (
    "listingStatus",
    "verificationStatus",
    "publicationStatus"
  );

CREATE INDEX IF NOT EXISTS prospect_calls_directory_permission_idx
  ON public.prospect_calls ("clinicId", "directoryPermissionStatus", "callEnvironment")
  WHERE "directoryPermissionStatus" = 'granted'
    AND "callEnvironment" = 'live';

ALTER TABLE public.prospect_directory_profiles ENABLE ROW LEVEL SECURITY;

-- Prospect publication workflow rows remain admin-only. The public receives
-- the reviewed Clinic projection, never the private prospect row.
REVOKE ALL ON TABLE public.prospect_directory_profiles FROM anon, authenticated;
GRANT ALL ON TABLE public.prospect_directory_profiles TO service_role;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_public_clinic(p_clinic_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.prospect_directory_profiles profile
    WHERE profile."publicClinicId" = p_clinic_id
      AND profile."listingStatus" = 'published'
      AND profile."verificationStatus" = 'verified'
      AND profile."publicationStatus" = 'published'
      AND profile."permissionSourceCallId" IS NOT NULL
      AND profile."permissionGrantedAt" IS NOT NULL
      AND profile."approvedAt" IS NOT NULL
      AND profile."publishedAt" IS NOT NULL
  );
$$;

REVOKE ALL ON FUNCTION private.is_public_clinic(text) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_public_clinic(text) TO anon, authenticated;

-- Replace the legacy allow-all clinic policies. A clinic and its child rows
-- are public only while a reviewed directory profile is actively published
-- and has a live permission-call record attached.
ALTER TABLE public."Clinic" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read clinics" ON public."Clinic";
CREATE POLICY "Public reads explicitly published clinics"
  ON public."Clinic"
  FOR SELECT
  TO anon, authenticated
  USING (private.is_public_clinic(id));

ALTER TABLE public."ClinicLocation" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read locations" ON public."ClinicLocation";
CREATE POLICY "Public reads locations for published clinics"
  ON public."ClinicLocation"
  FOR SELECT
  TO anon, authenticated
  USING (private.is_public_clinic("clinicId"));

ALTER TABLE public."ClinicProvider" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read providers" ON public."ClinicProvider";
CREATE POLICY "Public reads providers for published clinics"
  ON public."ClinicProvider"
  FOR SELECT
  TO anon, authenticated
  USING (private.is_public_clinic("clinicId"));

ALTER TABLE public."ClinicTreatment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read treatments" ON public."ClinicTreatment";
CREATE POLICY "Public reads treatments for published clinics"
  ON public."ClinicTreatment"
  FOR SELECT
  TO anon, authenticated
  USING (private.is_public_clinic("clinicId"));

ALTER TABLE public."ClinicReview" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read reviews" ON public."ClinicReview";
CREATE POLICY "Public reads reviews for published clinics"
  ON public."ClinicReview"
  FOR SELECT
  TO anon, authenticated
  USING (private.is_public_clinic("clinicId"));

COMMENT ON COLUMN public.prospect_directory_profiles."permissionSourceCallId" IS
  'Live prospect call that recorded explicit directory publication permission.';
COMMENT ON COLUMN public.prospect_directory_profiles."publicClinicId" IS
  'Reviewed public Clinic projection. Null until publication is approved.';
