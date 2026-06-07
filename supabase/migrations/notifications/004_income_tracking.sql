-- 004 — June 2026 income tracking and History

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Income tracking and History',
  'Log salary and other income on Add → Income. Review expenses and income together on History. Your dashboard now shows Income, Expenses, and Saved this month — and Money Coach plus monthly reports include your savings rate when you log income.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Income tracking and History'
    AND body = 'Log salary and other income on Add → Income. Review expenses and income together on History. Your dashboard now shows Income, Expenses, and Saved this month — and Money Coach plus monthly reports include your savings rate when you log income.'
);
