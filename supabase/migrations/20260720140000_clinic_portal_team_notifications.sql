-- Clinic portal team invites and in-app notifications.

CREATE TABLE IF NOT EXISTS public.portal_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_invitations_org_idx
  ON public.portal_invitations (organization_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.portal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NULL REFERENCES public.employer_organizations(id) ON DELETE CASCADE,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_notifications_user_idx
  ON public.portal_notifications (user_id, read_at, created_at DESC);

CREATE INDEX IF NOT EXISTS portal_notifications_org_idx
  ON public.portal_notifications (organization_id, created_at DESC);

ALTER TABLE public.portal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.portal_invitations FROM PUBLIC, anon;
REVOKE ALL ON public.portal_notifications FROM PUBLIC, anon;
GRANT ALL ON public.portal_invitations TO service_role;
GRANT ALL ON public.portal_notifications TO service_role;
