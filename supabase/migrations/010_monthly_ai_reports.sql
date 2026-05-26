-- Phase 6: persisted monthly AI reports and report language preference

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS monthly_report_language text NOT NULL DEFAULT 'en'
  CHECK (monthly_report_language IN ('en', 'bn'));

CREATE TABLE IF NOT EXISTS public.monthly_ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  report_month date NOT NULL,
  language text NOT NULL CHECK (language IN ('en', 'bn')),
  content text NOT NULL,
  input_snapshot jsonb,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_month, language)
);

CREATE INDEX IF NOT EXISTS idx_monthly_ai_reports_user_month
  ON public.monthly_ai_reports (user_id, report_month DESC);

DROP TRIGGER IF EXISTS monthly_ai_reports_set_updated_at
  ON public.monthly_ai_reports;
CREATE TRIGGER monthly_ai_reports_set_updated_at
  BEFORE UPDATE ON public.monthly_ai_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.monthly_ai_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own monthly AI reports"
  ON public.monthly_ai_reports;
CREATE POLICY "Users read own monthly AI reports"
  ON public.monthly_ai_reports FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own monthly AI reports"
  ON public.monthly_ai_reports;
CREATE POLICY "Users insert own monthly AI reports"
  ON public.monthly_ai_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own monthly AI reports"
  ON public.monthly_ai_reports;
CREATE POLICY "Users update own monthly AI reports"
  ON public.monthly_ai_reports FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own monthly AI reports"
  ON public.monthly_ai_reports;
CREATE POLICY "Users delete own monthly AI reports"
  ON public.monthly_ai_reports FOR DELETE
  USING (user_id = auth.uid());
