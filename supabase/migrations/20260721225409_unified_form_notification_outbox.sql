-- Unified, database-first form submission and notification outbox.
-- Source records remain in their domain tables; this is the operational index
-- used for delivery, retry, attribution, and the founder dashboard.

CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  idempotency_key text NOT NULL,
  form_type text NOT NULL CHECK (char_length(form_type) BETWEEN 2 AND 80),
  source_table text NOT NULL CHECK (char_length(source_table) BETWEEN 2 AND 120),
  source_record_id text NOT NULL CHECK (char_length(source_record_id) BETWEEN 1 AND 200),
  source_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  anonymous_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  organization text,
  safe_message text,
  safe_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  contains_sensitive_health_data boolean NOT NULL DEFAULT false,
  notification_status text NOT NULL DEFAULT 'pending'
    CHECK (notification_status IN ('pending', 'sent', 'partially_sent', 'failed', 'retrying')),
  slack_status text NOT NULL DEFAULT 'pending'
    CHECK (slack_status IN ('pending', 'sent', 'failed', 'retrying', 'not_configured')),
  email_status text NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed', 'retrying', 'not_configured')),
  processing_attempts integer NOT NULL DEFAULT 0 CHECK (processing_attempts >= 0),
  last_error text,
  environment text NOT NULL DEFAULT 'production',
  is_read boolean NOT NULL DEFAULT false,
  follow_up_status text NOT NULL DEFAULT 'new'
    CHECK (follow_up_status IN ('new', 'in_progress', 'waiting', 'completed', 'closed')),
  assigned_owner text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_type, idempotency_key),
  UNIQUE (source_table, source_record_id)
);

CREATE INDEX form_submissions_submitted_idx
  ON public.form_submissions (submitted_at DESC);
CREATE INDEX form_submissions_type_status_idx
  ON public.form_submissions (form_type, notification_status, submitted_at DESC);
CREATE INDEX form_submissions_campaign_idx
  ON public.form_submissions (utm_source, utm_campaign, submitted_at DESC);
CREATE INDEX form_submissions_unread_idx
  ON public.form_submissions (is_read, submitted_at DESC)
  WHERE is_read = false;

CREATE TABLE public.form_notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_submission_id uuid NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('slack', 'email')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'retrying', 'not_configured')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts BETWEEN 1 AND 20),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  provider_message_id text,
  recipient text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_submission_id, channel)
);

CREATE INDEX form_notification_delivery_retry_idx
  ON public.form_notification_deliveries (status, next_attempt_at)
  WHERE status IN ('pending', 'failed', 'retrying');

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_notification_deliveries ENABLE ROW LEVEL SECURITY;

-- Public clients never access either table. Server-side service-role clients
-- bypass RLS. Founder/admin JWTs may read and manage workflow state.
DROP POLICY IF EXISTS form_submissions_admin_select ON public.form_submissions;
CREATE POLICY form_submissions_admin_select
  ON public.form_submissions FOR SELECT TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

DROP POLICY IF EXISTS form_submissions_admin_update ON public.form_submissions;
CREATE POLICY form_submissions_admin_update
  ON public.form_submissions FOR UPDATE TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  )
  WITH CHECK (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

DROP POLICY IF EXISTS form_deliveries_admin_select ON public.form_notification_deliveries;
CREATE POLICY form_deliveries_admin_select
  ON public.form_notification_deliveries FOR SELECT TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

DROP POLICY IF EXISTS form_deliveries_admin_update ON public.form_notification_deliveries;
CREATE POLICY form_deliveries_admin_update
  ON public.form_notification_deliveries FOR UPDATE TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  )
  WITH CHECK (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

REVOKE ALL ON public.form_submissions FROM anon, authenticated;
REVOKE ALL ON public.form_notification_deliveries FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.form_submissions TO authenticated;
GRANT SELECT, UPDATE ON public.form_notification_deliveries TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
GRANT ALL ON public.form_notification_deliveries TO service_role;
