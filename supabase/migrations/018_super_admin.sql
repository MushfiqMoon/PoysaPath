-- Super admin: view-only user login stats. Promote admins via SQL (see supabase/README.md).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles (last_seen_at DESC NULLS LAST);

-- Backfill last_seen_at from Supabase Auth when available
UPDATE public.profiles p
SET last_seen_at = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id
  AND p.last_seen_at IS NULL
  AND u.last_sign_in_at IS NOT NULL;

-- App users cannot grant themselves super admin (SQL Editor / service role can)
CREATE OR REPLACE FUNCTION public.protect_profile_admin_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() = NEW.id THEN
    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
      NEW.is_super_admin := OLD.is_super_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_admin_flag ON public.profiles;
CREATE TRIGGER profiles_protect_admin_flag
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_admin_flag();

CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  UPDATE public.profiles
  SET last_seen_at = now()
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

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

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
