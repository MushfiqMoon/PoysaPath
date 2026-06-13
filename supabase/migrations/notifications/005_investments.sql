-- 005 — June 2026 investment tracking

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Investment tracking',
  'Track one-time contributions and multi-payment projects in Settings → Investments. Log each payment, watch progress toward your target, and see your total contributed — swipe through projects on mobile or open any card for full history.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Investment tracking'
    AND body = 'Track one-time contributions and multi-payment projects in Settings → Investments. Log each payment, watch progress toward your target, and see your total contributed — swipe through projects on mobile or open any card for full history.'
);
