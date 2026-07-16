CREATE OR REPLACE FUNCTION public.is_profile_owner(p_profile_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workforce_professional_profiles
    WHERE id = p_profile_id AND "userId" = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_profile_owner(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_profile_owner(text) TO authenticated;
DROP POLICY IF EXISTS "Allow public read avatars" ON storage.objects;;
