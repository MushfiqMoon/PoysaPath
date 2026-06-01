-- Drop unused last_user_login_at from admin stats RPC.

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_admin boolean;
  total_users int;
  users_logged_in int;
BEGIN
  SELECT p.is_super_admin
  INTO caller_admin
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF NOT COALESCE(caller_admin, false) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT
    count(*)::int,
    count(*) FILTER (WHERE last_seen_at IS NOT NULL)::int
  INTO total_users, users_logged_in
  FROM public.profiles;

  RETURN json_build_object(
    'total_users', total_users,
    'users_logged_in', users_logged_in
  );
END;
$$;
