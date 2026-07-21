-- Campaign attribution on AssessmentSubmission (additive).

ALTER TABLE public."AssessmentSubmission"
  ADD COLUMN IF NOT EXISTS "csPageId" uuid,
  ADD COLUMN IF NOT EXISTS "csCampaignId" uuid,
  ADD COLUMN IF NOT EXISTS "attributionJson" jsonb;

CREATE INDEX IF NOT EXISTS assessment_submission_cs_page_idx
  ON public."AssessmentSubmission" ("csPageId")
  WHERE "csPageId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS assessment_submission_cs_campaign_idx
  ON public."AssessmentSubmission" ("csCampaignId")
  WHERE "csCampaignId" IS NOT NULL;
