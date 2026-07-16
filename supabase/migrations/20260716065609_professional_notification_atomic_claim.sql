CREATE OR REPLACE FUNCTION public.claim_professional_notification(
  p_user_id uuid,
  p_profile_id text,
  p_event_key text
)
RETURNS TABLE(id uuid, attempts integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.professional_notification_deliveries (
    user_id, profile_id, event_key, delivery_status, attempts, last_error, updated_at
  )
  VALUES (p_user_id, p_profile_id, p_event_key, 'pending', 1, NULL, now())
  ON CONFLICT (user_id, event_key) DO UPDATE
    SET profile_id = EXCLUDED.profile_id,
        delivery_status = 'pending',
        attempts = public.professional_notification_deliveries.attempts + 1,
        last_error = NULL,
        updated_at = now()
    WHERE public.professional_notification_deliveries.delivery_status = 'failed'
       OR (
         public.professional_notification_deliveries.delivery_status = 'pending'
         AND public.professional_notification_deliveries.updated_at < now() - interval '5 minutes'
       )
  RETURNING public.professional_notification_deliveries.id,
            public.professional_notification_deliveries.attempts;
$$;
REVOKE ALL ON FUNCTION public.claim_professional_notification(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_professional_notification(uuid, text, text)
  TO service_role;;
