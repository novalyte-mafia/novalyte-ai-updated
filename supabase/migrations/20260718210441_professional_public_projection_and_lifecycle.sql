-- Public projection without PII + fix lifecycle updates for service_role.

CREATE TABLE IF NOT EXISTS public.professional_directory_profiles (
  profile_id text PRIMARY KEY
    REFERENCES public.workforce_professional_profiles(id) ON DELETE CASCADE,
  public_slug text UNIQUE,
  display_name text NOT NULL,
  title text NOT NULL,
  city text,
  state text,
  category text,
  specialty text,
  experience_band text,
  availability text,
  relocate boolean NOT NULL DEFAULT false,
  telehealth boolean NOT NULL DEFAULT false,
  bio text,
  verified boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS professional_directory_profiles_state_idx
  ON public.professional_directory_profiles (state);
CREATE INDEX IF NOT EXISTS professional_directory_profiles_specialty_idx
  ON public.professional_directory_profiles (specialty);

ALTER TABLE public.professional_directory_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read directory profiles" ON public.professional_directory_profiles;
CREATE POLICY "Public can read directory profiles"
  ON public.professional_directory_profiles
  FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL);

GRANT SELECT ON public.professional_directory_profiles TO anon, authenticated;
GRANT ALL ON public.professional_directory_profiles TO service_role;

CREATE OR REPLACE FUNCTION public.experience_band(p_years integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN COALESCE(p_years, 0) <= 0 THEN 'unspecified'
    WHEN p_years <= 2 THEN '1-2'
    WHEN p_years <= 5 THEN '3-5'
    WHEN p_years <= 10 THEN '5-10'
    ELSE '10+'
  END;
$$;

CREATE OR REPLACE FUNCTION public.sync_professional_directory_profile(p_profile_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  src public.workforce_professional_profiles%ROWTYPE;
  tele boolean := false;
BEGIN
  SELECT * INTO src
  FROM public.workforce_professional_profiles
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    DELETE FROM public.professional_directory_profiles WHERE profile_id = p_profile_id;
    RETURN;
  END IF;

  SELECT COALESCE(pref.telehealth, false) INTO tele
  FROM public.professional_preferences pref
  WHERE pref."profileId" = p_profile_id;

  IF src.review_status = 'approved'
     AND src.status = 'active'
     AND src.visibility_status = 'discoverable' THEN
    INSERT INTO public.professional_directory_profiles AS d (
      profile_id, public_slug, display_name, title, city, state, category, specialty,
      experience_band, availability, relocate, telehealth, bio, verified, published_at, updated_at
    ) VALUES (
      src.id,
      COALESCE(
        (SELECT public_slug FROM public.professional_directory_profiles WHERE profile_id = src.id),
        lower(regexp_replace(src.name || '-' || left(src.id, 8), '[^a-zA-Z0-9]+', '-', 'g'))
      ),
      src.name,
      src.title,
      src.city,
      src.state,
      src.category,
      src.specialty,
      public.experience_band(src.experience),
      src.availability,
      COALESCE(src.relocate, false),
      tele,
      src.bio,
      true,
      COALESCE(
        (SELECT published_at FROM public.professional_directory_profiles WHERE profile_id = src.id),
        now()
      ),
      now()
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      title = EXCLUDED.title,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      category = EXCLUDED.category,
      specialty = EXCLUDED.specialty,
      experience_band = EXCLUDED.experience_band,
      availability = EXCLUDED.availability,
      relocate = EXCLUDED.relocate,
      telehealth = EXCLUDED.telehealth,
      bio = EXCLUDED.bio,
      verified = true,
      published_at = COALESCE(d.published_at, now()),
      updated_at = now();
  ELSE
    DELETE FROM public.professional_directory_profiles WHERE profile_id = p_profile_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_professional_directory_profile(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_professional_directory_profile(text) TO service_role;

CREATE OR REPLACE FUNCTION public.trg_sync_professional_directory_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.sync_professional_directory_profile(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_professional_directory_profile ON public.workforce_professional_profiles;
CREATE TRIGGER trg_sync_professional_directory_profile
  AFTER INSERT OR UPDATE OF name, title, city, state, category, specialty, experience,
    availability, relocate, bio, review_status, status, visibility_status
  ON public.workforce_professional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_professional_directory_profile();

-- Lifecycle protection: allow service_role via auth.role(), block clients.
CREATE OR REPLACE FUNCTION public.protect_professional_lifecycle_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW."userId" IS DISTINCT FROM OLD."userId"
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.review_status IS DISTINCT FROM OLD.review_status
     OR NEW.onboarding_completed_at IS DISTINCT FROM OLD.onboarding_completed_at THEN
    RAISE EXCEPTION 'Professional lifecycle fields can only be changed by the server';
  END IF;

  RETURN NEW;
END;
$$;

-- Admin RPC used by Command Center / service routes.
CREATE OR REPLACE FUNCTION public.admin_set_professional_review_status(
  p_profile_id text,
  p_review_status text,
  p_reason text DEFAULT NULL
)
RETURNS public.workforce_professional_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated public.workforce_professional_profiles;
  next_status text;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'admin_set_professional_review_status requires service_role';
  END IF;

  IF p_review_status NOT IN ('pending_review', 'approved', 'rejected', 'suspended') THEN
    RAISE EXCEPTION 'Invalid review_status: %', p_review_status;
  END IF;

  next_status := CASE p_review_status
    WHEN 'approved' THEN 'active'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'suspended' THEN 'suspended'
    ELSE 'pending_review'
  END;

  UPDATE public.workforce_professional_profiles
  SET
    review_status = p_review_status,
    status = next_status,
    visibility_status = CASE
      WHEN p_review_status = 'approved' THEN visibility_status
      ELSE 'private'
    END,
    "updatedAt" = now()
  WHERE id = p_profile_id
  RETURNING * INTO updated;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_profile_id;
  END IF;

  PERFORM public.sync_professional_directory_profile(p_profile_id);
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_professional_review_status(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_professional_review_status(text, text, text) TO service_role;

-- Remove PII-exposing public SELECT on base profile table.
DROP POLICY IF EXISTS "Public can read approved professional profiles" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Professional can read permitted profiles" ON public.workforce_professional_profiles;
DROP POLICY IF EXISTS "Professional can read own profile" ON public.workforce_professional_profiles;

CREATE POLICY "Professional can read own profile"
  ON public.workforce_professional_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");

-- Backfill currently discoverable approved profiles into the projection.
DO $$
DECLARE
  pid text;
BEGIN
  FOR pid IN
    SELECT id FROM public.workforce_professional_profiles
    WHERE review_status = 'approved'
      AND status = 'active'
      AND visibility_status = 'discoverable'
  LOOP
    PERFORM public.sync_professional_directory_profile(pid);
  END LOOP;
END;
$$;
