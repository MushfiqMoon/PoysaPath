-- Super admin: list user emails and last visit (read-only).

CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_admin boolean;
BEGIN
  SELECT p.is_super_admin
  INTO caller_admin
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF NOT COALESCE(caller_admin, false) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'email', u.email,
          'last_seen_at', p.last_seen_at
        )
        ORDER BY p.last_seen_at DESC NULLS LAST, u.email ASC
      )
      FROM public.profiles p
      INNER JOIN auth.users u ON u.id = p.id
    ),
    '[]'::json
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_user_list() TO authenticated;
