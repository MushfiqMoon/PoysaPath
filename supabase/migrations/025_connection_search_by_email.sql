-- Connection search: return limited profile preview by email (before connect)

CREATE OR REPLACE FUNCTION public.lookup_connection_candidate_by_email(normalized_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_email text;
  result json;
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

  SELECT json_build_object(
    'id', p.id,
    'display_name', p.display_name,
    'avatar_url', p.avatar_url
  )
  INTO result
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE lower(trim(u.email)) = lower(trim(normalized_email))
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_connection_candidate_by_email(text) TO authenticated;
