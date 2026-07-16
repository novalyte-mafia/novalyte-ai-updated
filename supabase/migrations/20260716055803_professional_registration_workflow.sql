-- One authenticated professional account owns at most one onboarding draft,
-- application, and professional profile. Email verification and review status
-- remain independent lifecycle states.

ALTER TABLE public.workforce_professional_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending_review';

ALTER TABLE public.workforce_professional_profiles
  DROP CONSTRAINT IF EXISTS workforce_professional_profiles_review_status_check;
ALTER TABLE public.workforce_professional_profiles
  ADD CONSTRAINT workforce_professional_profiles_review_status_check
  CHECK (review_status IN ('pending_review', 'approved', 'rejected', 'suspended'));

ALTER TABLE public.workforce_professional_applications
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Preserve the newest legacy submission for each email before adding uniqueness.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY lower(email) ORDER BY created_at DESC, id DESC) AS rn
  FROM public.workforce_professional_applications
)
DELETE FROM public.workforce_professional_applications a
USING ranked r
WHERE a.id = r.id AND r.rn > 1;

UPDATE public.workforce_professional_applications a
SET user_id = u.id
FROM auth.users u
WHERE a.user_id IS NULL AND lower(a.email) = lower(u.email);

-- Preserve the newest legacy profile for each email. Child rows on older
-- duplicates are removed through their existing ON DELETE CASCADE constraints.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY lower(email) ORDER BY "createdAt" DESC, id DESC) AS rn
  FROM public.workforce_professional_profiles
)
DELETE FROM public.workforce_professional_profiles p
USING ranked r
WHERE p.id = r.id AND r.rn > 1;

UPDATE public.workforce_professional_profiles p
SET "userId" = u.id,
    onboarding_completed_at = COALESCE(p.onboarding_completed_at, p."createdAt"),
    review_status = CASE
      WHEN p.status IN ('approved', 'active') THEN 'approved'
      WHEN p.status = 'rejected' THEN 'rejected'
      WHEN p.status = 'suspended' THEN 'suspended'
      ELSE 'pending_review'
    END,
    status = CASE WHEN p.status IN ('approved', 'active') THEN 'active' ELSE 'pending_review' END,
    "updatedAt" = now()
FROM auth.users u
WHERE p."userId" IS NULL AND lower(p.email) = lower(u.email);

CREATE UNIQUE INDEX IF NOT EXISTS workforce_professional_profiles_user_id_unique
  ON public.workforce_professional_profiles ("userId") WHERE "userId" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS workforce_professional_applications_user_id_unique
  ON public.workforce_professional_applications (user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.professional_onboarding_drafts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0 CHECK (current_step BETWEEN 0 AND 9),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id text REFERENCES public.workforce_professional_profiles(id) ON DELETE CASCADE,
  event_key text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_key)
);

ALTER TABLE public.professional_onboarding_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professional can read own onboarding draft" ON public.professional_onboarding_drafts;
DROP POLICY IF EXISTS "Professional can update own onboarding draft" ON public.professional_onboarding_drafts;
CREATE POLICY "Professional can read own onboarding draft"
  ON public.professional_onboarding_drafts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Draft and final writes go through authenticated server routes using the
-- service role, so no browser INSERT/UPDATE policy is intentionally granted.

DROP POLICY IF EXISTS "Allow public insert profiles" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Allow users to insert own workforce profile" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Allow users to select own workforce profile" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Allow users to update own workforce profile" ON public.workforce_professional_profiles;

CREATE POLICY "Professional can read own profile"
  ON public.workforce_professional_profiles FOR SELECT TO authenticated
  USING (auth.uid() = "userId");
CREATE POLICY "Professional can update own profile"
  ON public.workforce_professional_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Public can read approved professional profiles"
  ON public.workforce_professional_profiles FOR SELECT TO anon, authenticated
  USING (review_status = 'approved' AND status = 'active');

DROP POLICY IF EXISTS "Allow public insert workforce" ON public.workforce_professional_applications;
CREATE POLICY "Professional can read own application"
  ON public.workforce_professional_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public access social" ON public.professional_social_links;
DROP POLICY IF EXISTS "Allow public access history" ON public.professional_employment_history;
DROP POLICY IF EXISTS "Allow public access education" ON public.professional_education;
DROP POLICY IF EXISTS "Allow public access licenses" ON public.professional_licenses;
DROP POLICY IF EXISTS "Allow public access certifications" ON public.professional_certifications;
DROP POLICY IF EXISTS "Allow public access skills" ON public.professional_skills;
DROP POLICY IF EXISTS "Allow public access preferences" ON public.professional_preferences;
DROP POLICY IF EXISTS "Allow public access documents" ON public.professional_documents;
DROP POLICY IF EXISTS "Allow public access alerts" ON public.professional_job_alerts;
DROP POLICY IF EXISTS "Allow public access matches" ON public.workforce_job_matches;
DROP POLICY IF EXISTS "Allow public access notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public access preferences_notify" ON public.notification_preferences;

CREATE INDEX IF NOT EXISTS professional_notification_deliveries_status_idx
  ON public.professional_notification_deliveries (delivery_status, created_at);
;
