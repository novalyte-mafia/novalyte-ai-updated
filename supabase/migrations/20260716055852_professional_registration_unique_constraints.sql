ALTER TABLE public.workforce_professional_profiles
  DROP CONSTRAINT IF EXISTS workforce_professional_profiles_user_id_key;
ALTER TABLE public.workforce_professional_profiles
  ADD CONSTRAINT workforce_professional_profiles_user_id_key UNIQUE ("userId");
ALTER TABLE public.workforce_professional_applications
  DROP CONSTRAINT IF EXISTS workforce_professional_applications_user_id_key;
ALTER TABLE public.workforce_professional_applications
  ADD CONSTRAINT workforce_professional_applications_user_id_key UNIQUE (user_id);;
