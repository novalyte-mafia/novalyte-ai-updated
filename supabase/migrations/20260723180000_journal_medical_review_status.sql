-- Journal medical-review status for Content Studio / editorial workflow.
-- Does not weaken RLS: public reads remain published-only via existing policies.

ALTER TABLE public."Article"
  ADD COLUMN IF NOT EXISTS "medicalReviewStatus" text;

ALTER TABLE public."Article"
  DROP CONSTRAINT IF EXISTS article_medical_review_status_check;

ALTER TABLE public."Article"
  ADD CONSTRAINT article_medical_review_status_check
  CHECK (
    "medicalReviewStatus" IS NULL
    OR "medicalReviewStatus" IN (
      'draft',
      'editorial_review',
      'medical_review_required',
      'medically_reviewed',
      'approved',
      'published'
    )
  );

COMMENT ON COLUMN public."Article"."medicalReviewStatus" IS
  'Editorial medical-review workflow. Admin-only signal; do not treat as public medical endorsement.';
