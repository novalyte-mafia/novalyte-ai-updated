-- Protected auth roles: never authorize from user_metadata or editable profiles.role.
-- Authoritative claims live in auth.users.raw_app_meta_data.account_types.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    "updatedAt" = now();

  -- Ensure app_metadata exists; do not copy client-supplied roles.
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'account_types',
      COALESCE(raw_app_meta_data->'account_types', '[]'::jsonb)
    )
  WHERE id = NEW.id
    AND (
      raw_app_meta_data IS NULL
      OR raw_app_meta_data->'account_types' IS NULL
    );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Prevent clients from elevating profiles.role (legacy column kept for compatibility).
CREATE OR REPLACE FUNCTION public.protect_profiles_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'profiles.role is not user-editable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profiles_role ON public.profiles;
CREATE TRIGGER protect_profiles_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_role();

REVOKE ALL ON FUNCTION public.protect_profiles_role() FROM PUBLIC, anon, authenticated;

-- Helper: does the JWT carry a protected account type?
CREATE OR REPLACE FUNCTION public.has_account_type(p_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT auth.jwt() -> 'app_metadata' -> 'account_types') ? p_type,
    false
  );
$$;

REVOKE ALL ON FUNCTION public.has_account_type(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_account_type(text) TO authenticated, service_role;

-- Service-role-only helper to merge account_types into app_metadata.
CREATE OR REPLACE FUNCTION public.grant_account_type(p_user_id uuid, p_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_types jsonb;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'grant_account_type requires service_role';
  END IF;

  IF p_type NOT IN ('professional', 'employer', 'admin', 'professional_reviewer', 'organization_reviewer') THEN
    RAISE EXCEPTION 'Unsupported account type: %', p_type;
  END IF;

  SELECT COALESCE(raw_app_meta_data->'account_types', '[]'::jsonb)
  INTO current_types
  FROM auth.users
  WHERE id = p_user_id;

  IF current_types IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  IF NOT (current_types ? p_type) THEN
    current_types := current_types || jsonb_build_array(p_type);
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('account_types', current_types)
  WHERE id = p_user_id;

  UPDATE public.profiles
  SET role = CASE
        WHEN p_type IN ('professional', 'employer') THEN p_type
        ELSE role
      END,
      "updatedAt" = now()
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_account_type(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_account_type(uuid, text) TO service_role;

-- Backfill: only users with linked workforce profile/application become professionals.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT u.id
    FROM auth.users u
    WHERE EXISTS (
      SELECT 1 FROM public.workforce_professional_profiles p WHERE p."userId" = u.id
    )
    OR EXISTS (
      SELECT 1 FROM public.workforce_professional_applications a WHERE a.user_id = u.id
    )
  LOOP
    PERFORM public.grant_account_type(r.id, 'professional');
  END LOOP;
END;
$$;
