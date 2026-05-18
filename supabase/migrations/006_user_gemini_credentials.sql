-- Per-user encrypted Gemini API keys (BYOK)

CREATE TABLE IF NOT EXISTS public.user_gemini_credentials (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  api_key_ciphertext text NOT NULL,
  key_hint text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_gemini_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own gemini credentials" ON public.user_gemini_credentials;
CREATE POLICY "Users read own gemini credentials"
  ON public.user_gemini_credentials FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own gemini credentials" ON public.user_gemini_credentials;
CREATE POLICY "Users insert own gemini credentials"
  ON public.user_gemini_credentials FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own gemini credentials" ON public.user_gemini_credentials;
CREATE POLICY "Users update own gemini credentials"
  ON public.user_gemini_credentials FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own gemini credentials" ON public.user_gemini_credentials;
CREATE POLICY "Users delete own gemini credentials"
  ON public.user_gemini_credentials FOR DELETE
  USING (user_id = auth.uid());
