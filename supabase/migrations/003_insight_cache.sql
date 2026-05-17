-- Phase 2: weekly Gemini insight cache

CREATE TABLE IF NOT EXISTS public.insight_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  week_start date NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_insight_cache_user_week ON public.insight_cache (user_id, week_start);

ALTER TABLE public.insight_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own insights" ON public.insight_cache;
CREATE POLICY "Users read own insights"
  ON public.insight_cache FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own insights" ON public.insight_cache;
CREATE POLICY "Users insert own insights"
  ON public.insight_cache FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own insights" ON public.insight_cache;
CREATE POLICY "Users update own insights"
  ON public.insight_cache FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own insights" ON public.insight_cache;
CREATE POLICY "Users delete own insights"
  ON public.insight_cache FOR DELETE
  USING (user_id = auth.uid());
