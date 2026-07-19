-- Private document metadata + bucket-scoped storage policies.

ALTER TABLE public.professional_documents
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS bucket_id text,
  ADD COLUMN IF NOT EXISTS object_path text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS checksum text,
  ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'pending'
    CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now();

-- Migrate legacy status into verification_status where sensible.
UPDATE public.professional_documents
SET verification_status = CASE
      WHEN status IN ('verified') THEN 'pending' -- never trust client-forged verified
      WHEN status IN ('rejected') THEN 'rejected'
      ELSE 'pending'
    END,
    upload_status = CASE
      WHEN path IS NOT NULL AND path <> '' THEN 'uploaded'
      ELSE 'pending'
    END,
    bucket_id = COALESCE(bucket_id, 'professional-resumes'),
    object_path = COALESCE(object_path, path)
WHERE true;

CREATE UNIQUE INDEX IF NOT EXISTS professional_documents_bucket_object_unique
  ON public.professional_documents (bucket_id, object_path)
  WHERE bucket_id IS NOT NULL AND object_path IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_professional_document_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.verification_status := 'pending';
    NEW.verified_by := NULL;
    NEW.verified_at := NULL;
    IF NEW.upload_status IS NULL THEN
      NEW.upload_status := 'pending';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
       OR NEW.verified_by IS DISTINCT FROM OLD.verified_by
       OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
      RAISE EXCEPTION 'Document verification fields can only be changed by the server';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_professional_document_verification ON public.professional_documents;
CREATE TRIGGER protect_professional_document_verification
  BEFORE INSERT OR UPDATE ON public.professional_documents
  FOR EACH ROW EXECUTE FUNCTION public.protect_professional_document_verification();

-- Ensure private buckets exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('professional-avatars', 'professional-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('professional-resumes', 'professional-resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('professional-credentials', 'professional-credentials', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Replace broad cross-bucket storage policy with bucket-scoped owner policies.
DROP POLICY IF EXISTS "Allow users to manage own storage files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read avatars" ON storage.objects;

CREATE POLICY "Public can read professional avatars"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'professional-avatars');

CREATE POLICY "Users manage own professional avatars"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'professional-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'professional-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users manage own professional resumes"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'professional-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'professional-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users manage own professional credentials"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'professional-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'professional-credentials'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.admin_set_document_verification(
  p_document_id text,
  p_status text,
  p_reviewer text DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS public.professional_documents
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  doc public.professional_documents;
BEGIN
  IF NOT (
    COALESCE(auth.role(), '') = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'admin_set_document_verification requires service_role';
  END IF;

  IF p_status NOT IN ('pending', 'verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid verification status';
  END IF;

  UPDATE public.professional_documents
  SET verification_status = p_status,
      status = p_status,
      verified_by = CASE WHEN p_status = 'verified' THEN p_reviewer ELSE NULL END,
      verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
      rejection_reason = CASE WHEN p_status = 'rejected' THEN p_reason ELSE NULL END,
      "updatedAt" = now()
  WHERE id = p_document_id
  RETURNING * INTO doc;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  RETURN doc;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_document_verification(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_document_verification(text, text, text, text) TO service_role;
