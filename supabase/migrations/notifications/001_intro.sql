-- 001 — Intro announcement (all users until marked read)

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Notifications',
  'Notifications will be available, so you''ll get updates about new features.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Notifications'
    AND body = 'Notifications will be available, so you''ll get updates about new features.'
);
