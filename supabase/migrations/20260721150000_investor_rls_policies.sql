-- Investor portal RLS follow-up: explicit policies for tables that were
-- service-role-only (RLS on, zero policies). Clears advisor warnings and
-- allows founder_admin JWT reads without requiring the service role for SELECTs.

-- Access requests: founders read all; submitters never read via client (API uses service role).
DROP POLICY IF EXISTS investor_access_requests_founder_select ON public.investor_access_requests;
CREATE POLICY investor_access_requests_founder_select
  ON public.investor_access_requests
  FOR SELECT
  TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

-- Invitations: founder only
DROP POLICY IF EXISTS investor_invitations_founder_select ON public.investor_invitations;
CREATE POLICY investor_invitations_founder_select
  ON public.investor_invitations
  FOR SELECT
  TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

-- Meeting requests: requester can read own rows; founder reads all
DROP POLICY IF EXISTS investor_meeting_requests_select_own ON public.investor_meeting_requests;
CREATE POLICY investor_meeting_requests_select_own
  ON public.investor_meeting_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

-- Notes: founder only
DROP POLICY IF EXISTS investor_notes_founder_select ON public.investor_notes;
CREATE POLICY investor_notes_founder_select
  ON public.investor_notes
  FOR SELECT
  TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

-- Notification deliveries: founder only
DROP POLICY IF EXISTS investor_notification_deliveries_founder_select
  ON public.investor_notification_deliveries;
CREATE POLICY investor_notification_deliveries_founder_select
  ON public.investor_notification_deliveries
  FOR SELECT
  TO authenticated
  USING (
    public.has_account_type('founder_admin')
    OR public.has_account_type('admin')
  );

-- Document versions: approved investors can read versions of documents they can see
DROP POLICY IF EXISTS investor_document_versions_approved_select
  ON public.investor_document_versions;
CREATE POLICY investor_document_versions_approved_select
  ON public.investor_document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.investor_documents d
      WHERE d.id = document_id
        AND d.deleted_at IS NULL
        AND d.visibility = 'approved_investors'
        AND (
          public.has_account_type('investor_approved')
          OR public.has_account_type('founder_admin')
          OR public.has_account_type('admin')
          OR public.has_account_type('advisor')
          OR public.has_account_type('internal_team')
        )
    )
  );

-- Use of funds: approved investors when parent round is published
DROP POLICY IF EXISTS investor_use_of_funds_published_select ON public.investor_use_of_funds;
CREATE POLICY investor_use_of_funds_published_select
  ON public.investor_use_of_funds
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.investor_fundraising_rounds r
      WHERE r.id = round_id
        AND r.status = 'published'
    )
    AND (
      public.has_account_type('investor_approved')
      OR public.has_account_type('founder_admin')
      OR public.has_account_type('admin')
      OR public.has_account_type('advisor')
      OR public.has_account_type('internal_team')
    )
  );

-- Financial series: approved investors when parent scenario is published
DROP POLICY IF EXISTS investor_financial_series_published_select
  ON public.investor_financial_series;
CREATE POLICY investor_financial_series_published_select
  ON public.investor_financial_series
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.investor_financial_scenarios s
      WHERE s.id = scenario_id
        AND s.status = 'published'
    )
    AND (
      public.has_account_type('investor_approved')
      OR public.has_account_type('founder_admin')
      OR public.has_account_type('admin')
      OR public.has_account_type('advisor')
      OR public.has_account_type('internal_team')
    )
  );
