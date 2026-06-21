-- 006 — Follow-Ups (shared money reminders with connections)

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Follow-Ups',
  'Nudge people you trust about money tasks — rent shares, repayments, and the rest. Connect with someone in Settings → Profile, then send Follow-Ups from Settings → Follow-Ups. They''ll see it in their bell until it''s done.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Follow-Ups'
    AND body = 'Nudge people you trust about money tasks — rent shares, repayments, and the rest. Connect with someone in Settings → Profile, then send Follow-Ups from Settings → Follow-Ups. They''ll see it in their bell until it''s done.'
);
