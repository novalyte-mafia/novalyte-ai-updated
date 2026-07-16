DROP POLICY IF EXISTS "Professional can read own onboarding draft"
  ON public.professional_onboarding_drafts;
CREATE POLICY "Professional can read own onboarding draft"
  ON public.professional_onboarding_drafts FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Professional can update own profile"
  ON public.workforce_professional_profiles;
CREATE POLICY "Professional can update own profile"
  ON public.workforce_professional_profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = "userId")
  WITH CHECK ((SELECT auth.uid()) = "userId");

DROP POLICY IF EXISTS "Professional can read permitted profiles"
  ON public.workforce_professional_profiles;
CREATE POLICY "Professional can read permitted profiles"
  ON public.workforce_professional_profiles FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = "userId"
    OR (review_status = 'approved' AND status = 'active' AND visibility_status = 'discoverable')
  );

DROP POLICY IF EXISTS "Professional can read own application"
  ON public.workforce_professional_applications;
CREATE POLICY "Professional can read own application"
  ON public.workforce_professional_applications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
