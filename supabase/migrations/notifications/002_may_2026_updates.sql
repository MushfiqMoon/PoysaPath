-- 002 — May 2026 product updates (all users until marked read)

INSERT INTO public.notifications (title, body, kind)
SELECT
  'What''s new today',
  'Tap Recent expenses on Home to edit in one tap. AI is now yours: add your free Gemini key in Settings → AI (takes a minute at aistudio.google.com/api-keys). Need a hand? Message Mushfiq on LinkedIn or WhatsApp 01686076447.',
  'feature'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.notifications
  WHERE title = 'What''s new today'
    AND body LIKE 'Tap Recent expenses on Home%'
);
