-- Run once if users signed up before Phase 1 migrations (optional backfill)

INSERT INTO public.profiles (id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

INSERT INTO public.categories (user_id, name, icon, sort_order)
SELECT u.id, c.name, c.icon, c.sort_order
FROM auth.users u
CROSS JOIN public.categories c
WHERE c.user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM public.categories uc WHERE uc.user_id = u.id LIMIT 1
);
