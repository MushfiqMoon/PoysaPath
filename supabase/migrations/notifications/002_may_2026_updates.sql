-- 002 — May 2026 product updates (all users until marked read)

INSERT INTO public.notifications (title, body, kind)
SELECT
  'Personal API key',
  'AI is now yours: add your free Gemini key in Settings → AI. takes a minute at (aistudio.google.com/api-keys). Need a hand? Message Mushfiq 01686076447.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'Personal API key'
    AND body LIKE 'Tap Recent expenses on Home%'
);
