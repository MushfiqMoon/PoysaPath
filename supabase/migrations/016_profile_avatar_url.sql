-- Profile avatar + sync display name from OAuth metadata on sign-up

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.oauth_profile_display_name(meta jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    TRIM(COALESCE(meta->>'full_name', meta->>'name')),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.oauth_profile_avatar_url(meta jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    TRIM(COALESCE(meta->>'avatar_url', meta->>'picture')),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    public.oauth_profile_display_name(NEW.raw_user_meta_data),
    public.oauth_profile_avatar_url(NEW.raw_user_meta_data)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, sort_order)
  SELECT NEW.id, c.name, c.icon, c.sort_order
  FROM public.categories c
  WHERE c.user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.categories uc WHERE uc.user_id = NEW.id LIMIT 1
  );

  RETURN NEW;
END;
$$;

-- Backfill OAuth metadata for existing users without overwriting custom names
UPDATE public.profiles p
SET
  display_name = COALESCE(
    NULLIF(TRIM(p.display_name), ''),
    public.oauth_profile_display_name(u.raw_user_meta_data)
  ),
  avatar_url = COALESCE(
    NULLIF(TRIM(p.avatar_url), ''),
    public.oauth_profile_avatar_url(u.raw_user_meta_data)
  ),
  updated_at = now()
FROM auth.users u
WHERE p.id = u.id
AND (
  public.oauth_profile_display_name(u.raw_user_meta_data) IS NOT NULL
  OR public.oauth_profile_avatar_url(u.raw_user_meta_data) IS NOT NULL
)
AND (
  NULLIF(TRIM(p.display_name), '') IS NULL
  OR NULLIF(TRIM(p.avatar_url), '') IS NULL
);
