-- Directory preview listing classification.
-- Supports demo + unclaimed public-source rows without implying verification.

ALTER TABLE public."Clinic"
  ADD COLUMN IF NOT EXISTS "listingStatus" text NOT NULL DEFAULT 'unclaimed',
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS "dataSource" text,
  ADD COLUMN IF NOT EXISTS "sourceUrl" text,
  ADD COLUMN IF NOT EXISTS "lastReviewedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "financingAvailable" boolean,
  ADD COLUMN IF NOT EXISTS "inPersonAvailable" boolean,
  ADD COLUMN IF NOT EXISTS "sameDayConsultations" boolean,
  ADD COLUMN IF NOT EXISTS "bookingUrl" text;

ALTER TABLE public."Clinic"
  DROP CONSTRAINT IF EXISTS clinic_listing_status_check;

ALTER TABLE public."Clinic"
  ADD CONSTRAINT clinic_listing_status_check
  CHECK ("listingStatus" IN ('demo', 'unclaimed', 'claimed', 'verified'));

CREATE INDEX IF NOT EXISTS clinic_listing_status_idx
  ON public."Clinic" ("listingStatus")
  WHERE "deletedAt" IS NULL;

COMMENT ON COLUMN public."Clinic"."listingStatus" IS
  'demo = fictional preview; unclaimed = public-source; claimed = ownership confirmed; verified = Novalyte-approved.';

-- Allow service-role seed scripts to upsert preview rows. Public anon still
-- relies on private.is_public_clinic OR the server-side merge in listPublishedClinics.
