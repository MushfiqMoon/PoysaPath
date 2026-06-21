-- Connections (mutual email invite) + shared money reminders + per-user inbox

-- ---------------------------------------------------------------------------
-- connection_requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'cancelled', 'removed')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CHECK (requester_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_requester
  ON public.connection_requests (requester_id, status);

CREATE INDEX IF NOT EXISTS idx_connection_requests_recipient
  ON public.connection_requests (recipient_id, status);

-- One active pending or accepted request per user pair (either direction)
CREATE UNIQUE INDEX IF NOT EXISTS idx_connection_requests_active_pair
  ON public.connection_requests (
    LEAST(requester_id, recipient_id),
    GREATEST(requester_id, recipient_id)
  )
  WHERE status IN ('pending', 'accepted');

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own connection requests" ON public.connection_requests;
CREATE POLICY "Users read own connection requests"
  ON public.connection_requests FOR SELECT
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users insert connection requests" ON public.connection_requests;
CREATE POLICY "Users insert connection requests"
  ON public.connection_requests FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Users update own connection requests" ON public.connection_requests;
CREATE POLICY "Users update own connection requests"
  ON public.connection_requests FOR UPDATE
  USING (requester_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (requester_id = auth.uid() OR recipient_id = auth.uid());

-- ---------------------------------------------------------------------------
-- shared_reminders
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shared_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  assignee_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  note text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  CHECK (creator_id <> assignee_id)
);

CREATE INDEX IF NOT EXISTS idx_shared_reminders_creator
  ON public.shared_reminders (creator_id, status);

CREATE INDEX IF NOT EXISTS idx_shared_reminders_assignee
  ON public.shared_reminders (assignee_id, status);

DROP TRIGGER IF EXISTS shared_reminders_set_updated_at ON public.shared_reminders;
CREATE TRIGGER shared_reminders_set_updated_at
  BEFORE UPDATE ON public.shared_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shared_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own shared reminders" ON public.shared_reminders;
CREATE POLICY "Users read own shared reminders"
  ON public.shared_reminders FOR SELECT
  USING (creator_id = auth.uid() OR assignee_id = auth.uid());

DROP POLICY IF EXISTS "Users insert shared reminders" ON public.shared_reminders;
CREATE POLICY "Users insert shared reminders"
  ON public.shared_reminders FOR INSERT
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Users update own shared reminders" ON public.shared_reminders;
CREATE POLICY "Users update own shared reminders"
  ON public.shared_reminders FOR UPDATE
  USING (creator_id = auth.uid() OR assignee_id = auth.uid())
  WITH CHECK (creator_id = auth.uid() OR assignee_id = auth.uid());

-- ---------------------------------------------------------------------------
-- user_inbox_notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_inbox_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  shared_reminder_id uuid REFERENCES public.shared_reminders (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('shared_reminder_assigned', 'shared_reminder_done')),
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_inbox_notifications_user_unread
  ON public.user_inbox_notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;

ALTER TABLE public.user_inbox_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own inbox" ON public.user_inbox_notifications;
CREATE POLICY "Users read own inbox"
  ON public.user_inbox_notifications FOR SELECT
  USING (user_id = auth.uid());

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
  );

DROP POLICY IF EXISTS "Users update own inbox" ON public.user_inbox_notifications;
CREATE POLICY "Users update own inbox"
  ON public.user_inbox_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- profiles: read connected users (display name + avatar only via SELECT *)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users read connected profiles" ON public.profiles;
CREATE POLICY "Users read connected profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.connection_requests cr
      WHERE cr.status IN ('pending', 'accepted')
        AND (
          (cr.requester_id = auth.uid() AND cr.recipient_id = profiles.id)
          OR (cr.recipient_id = auth.uid() AND cr.requester_id = profiles.id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Helper: are two users connected?
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.are_users_connected(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connection_requests cr
    WHERE cr.status = 'accepted'
      AND (
        (cr.requester_id = user_a AND cr.recipient_id = user_b)
        OR (cr.requester_id = user_b AND cr.recipient_id = user_a)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.are_users_connected(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: lookup profile id by email (for connection invites)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.lookup_profile_id_by_email(normalized_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_email text;
  found_id uuid;
BEGIN
  IF normalized_email IS NULL OR trim(normalized_email) = '' THEN
    RETURN NULL;
  END IF;

  SELECT lower(trim(u.email))
  INTO caller_email
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF caller_email IS NOT NULL AND caller_email = lower(trim(normalized_email)) THEN
    RAISE EXCEPTION 'You cannot connect with yourself.' USING ERRCODE = '22000';
  END IF;

  SELECT p.id
  INTO found_id
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE lower(trim(u.email)) = lower(trim(normalized_email))
  LIMIT 1;

  RETURN found_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_profile_id_by_email(text) TO authenticated;
