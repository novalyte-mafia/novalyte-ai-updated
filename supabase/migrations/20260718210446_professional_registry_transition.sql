-- Dual-read registry transition: link legacy Professional to workforce profiles (manual only).

CREATE TABLE IF NOT EXISTS public.professional_registry_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_professional_id text NOT NULL REFERENCES public."Professional"(id) ON DELETE CASCADE,
  workforce_profile_id text NOT NULL REFERENCES public.workforce_professional_profiles(id) ON DELETE CASCADE,
  link_status text NOT NULL DEFAULT 'manual_review'
    CHECK (link_status IN ('manual_review', 'linked', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (legacy_professional_id),
  UNIQUE (workforce_profile_id)
);

ALTER TABLE public.professional_registry_links ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated write access; service role manages links.
GRANT SELECT ON public.professional_registry_links TO authenticated;
GRANT ALL ON public.professional_registry_links TO service_role;

-- Unified public registry view for dual-read cutover.
CREATE OR REPLACE VIEW public.professional_registry_entries
WITH (security_invoker = true)
AS
SELECT
  d.profile_id AS id,
  'workforce'::text AS source,
  d.public_slug,
  d.display_name AS name,
  d.title,
  d.city,
  d.state,
  false AS remote,
  d.specialty,
  d.experience_band,
  d.availability,
  d.bio,
  d.verified,
  d.published_at AS "createdAt",
  d.updated_at AS "updatedAt"
FROM public.professional_directory_profiles d
WHERE d.published_at IS NOT NULL
UNION ALL
SELECT
  p.id,
  'legacy'::text AS source,
  NULL::text AS public_slug,
  p.name,
  p.title,
  p.city,
  p.state,
  COALESCE(p.remote, false) AS remote,
  p.specialties AS specialty,
  CASE
    WHEN COALESCE(p."yearsExperience", 0) <= 0 THEN 'unspecified'
    WHEN p."yearsExperience" <= 2 THEN '1-2'
    WHEN p."yearsExperience" <= 5 THEN '3-5'
    WHEN p."yearsExperience" <= 10 THEN '5-10'
    ELSE '10+'
  END AS experience_band,
  p.availability,
  p.bio,
  COALESCE(p.verified, false) AS verified,
  p."createdAt",
  p."updatedAt"
FROM public."Professional" p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.professional_registry_links l
  WHERE l.legacy_professional_id = p.id
    AND l.link_status = 'linked'
);

GRANT SELECT ON public.professional_registry_entries TO anon, authenticated, service_role;

-- Freeze legacy Professional writes from authenticated clients (keep service_role for seeds/admin).
DROP POLICY IF EXISTS "Allow public insert professionals" ON public."Professional";
DROP POLICY IF EXISTS "Allow public update professionals" ON public."Professional";
DROP POLICY IF EXISTS "Allow authenticated insert professionals" ON public."Professional";
DROP POLICY IF EXISTS "Allow authenticated update professionals" ON public."Professional";
