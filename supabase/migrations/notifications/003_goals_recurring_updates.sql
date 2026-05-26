-- 003 — May 2026 planning and AI updates

INSERT INTO public.notifications (title, body, kind)
SELECT
  'New planning and AI tools',
  'Today''s update adds financial goals with monthly challenges, recurring expenses with reminder alerts, the dashboard AI Money Coach card, and a Monthly AI report in Settings.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'New planning and AI tools'
    AND body = 'Today''s update adds financial goals with monthly challenges, recurring expenses with reminder alerts, the dashboard AI Money Coach card, and a Monthly AI report in Settings.'
);
