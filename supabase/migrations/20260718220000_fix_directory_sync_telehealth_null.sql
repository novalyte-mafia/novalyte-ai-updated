-- Fix: SELECT INTO with 0 rows nulls the target variable, wiping tele := false.

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

  tele := COALESCE(tele, false);

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
