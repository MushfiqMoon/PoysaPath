-- Broadcast notifications + per-user read state
--
-- Flow:
-- 1. Insert one row into `notifications` when shipping a new feature (SQL Editor / service role).
-- 2. Each user sees it until they mark it read (row in `user_notification_reads`).
-- 3. Unread = notification with no read row for that user_id.

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  kind text NOT NULL DEFAULT 'feature',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_notification_reads (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  notification_id uuid NOT NULL REFERENCES public.notifications (id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notification_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_reads_user
  ON public.user_notification_reads (user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- All signed-in users can read announcements
DROP POLICY IF EXISTS "Users read notifications" ON public.notifications;
CREATE POLICY "Users read notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

-- Users manage only their own read state
DROP POLICY IF EXISTS "Users read own notification reads" ON public.user_notification_reads;
CREATE POLICY "Users read own notification reads"
  ON public.user_notification_reads FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own notification reads" ON public.user_notification_reads;
CREATE POLICY "Users insert own notification reads"
  ON public.user_notification_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Service role / SQL Editor inserts into notifications (no INSERT policy for clients)

-- Helper: create a broadcast announcement (run as service role or in SQL Editor)
CREATE OR REPLACE FUNCTION public.create_broadcast_notification(
  p_title text,
  p_body text,
  p_kind text DEFAULT 'feature'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (title, body, kind)
  VALUES (p_title, p_body, p_kind)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_broadcast_notification(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_broadcast_notification(text, text, text) TO service_role;
