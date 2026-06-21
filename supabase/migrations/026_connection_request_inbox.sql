-- Bell notifications for incoming connection requests

ALTER TABLE public.user_inbox_notifications
  ADD COLUMN IF NOT EXISTS connection_request_id uuid
  REFERENCES public.connection_requests (id) ON DELETE CASCADE;

ALTER TABLE public.user_inbox_notifications
  DROP CONSTRAINT IF EXISTS user_inbox_notifications_kind_check;

ALTER TABLE public.user_inbox_notifications
  ADD CONSTRAINT user_inbox_notifications_kind_check
  CHECK (
    kind IN (
      'shared_reminder_assigned',
      'shared_reminder_done',
      'connection_request_received'
    )
  );

DROP POLICY IF EXISTS "Users insert inbox for connected peers" ON public.user_inbox_notifications;
CREATE POLICY "Users insert inbox for connected peers"
  ON public.user_inbox_notifications FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.connection_requests cr
      WHERE cr.status = 'accepted'
        AND (
          (cr.requester_id = auth.uid() AND cr.recipient_id = user_id)
          OR (cr.recipient_id = auth.uid() AND cr.requester_id = user_id)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.connection_requests cr
      WHERE cr.status = 'pending'
        AND cr.requester_id = auth.uid()
        AND cr.recipient_id = user_id
        AND (
          connection_request_id IS NULL
          OR cr.id = connection_request_id
        )
    )
  );
