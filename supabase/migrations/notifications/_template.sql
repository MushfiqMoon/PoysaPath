-- 00N — Short description of this announcement
-- Copy this file, rename (e.g. 002_budgets_launch.sql), then run in SQL Editor.

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Title here',
  'Message body here.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Title here'
    AND body = 'Message body here.'
);
