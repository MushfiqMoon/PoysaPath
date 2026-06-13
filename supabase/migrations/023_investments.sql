-- Investment projects (one-time or multi-payment) + per-payment history.
-- Replaces legacy flat investments table. Tracking-only; no expense/income side effects.
-- Near-future stocks: sibling stock_trades table, not columns here.

DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.investment_payments CASCADE;
DROP TABLE IF EXISTS public.investment_projects CASCADE;

CREATE TABLE public.investment_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (
    char_length(trim(title)) >= 1 AND char_length(title) <= 120
  ),
  description text,
  kind text NOT NULL CHECK (kind IN ('one_time', 'multi_payment')),
  target_amount numeric(12, 2) CHECK (
    target_amount IS NULL OR target_amount > 0
  ),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT investment_projects_target_for_multi CHECK (
    (kind = 'one_time' AND target_amount IS NULL)
    OR (kind = 'multi_payment' AND target_amount IS NOT NULL)
  )
);

CREATE INDEX idx_investment_projects_user_created
  ON public.investment_projects (user_id, created_at DESC);

CREATE TABLE public.investment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.investment_projects (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_investment_payments_project_date
  ON public.investment_payments (project_id, payment_date DESC);
CREATE INDEX idx_investment_payments_user_created
  ON public.investment_payments (user_id, created_at DESC);

COMMENT ON TABLE public.investment_projects IS
  'Investment container: one-time (single payment) or multi-payment (installments toward target).';
COMMENT ON TABLE public.investment_payments IS
  'Individual payment toward an investment project; each row can have its own note.';

DROP TRIGGER IF EXISTS investment_projects_set_updated_at ON public.investment_projects;
CREATE TRIGGER investment_projects_set_updated_at
  BEFORE UPDATE ON public.investment_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.investment_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investment_projects_select ON public.investment_projects;
CREATE POLICY investment_projects_select ON public.investment_projects
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS investment_projects_insert ON public.investment_projects;
CREATE POLICY investment_projects_insert ON public.investment_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS investment_projects_update ON public.investment_projects;
CREATE POLICY investment_projects_update ON public.investment_projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS investment_projects_delete ON public.investment_projects;
CREATE POLICY investment_projects_delete ON public.investment_projects
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS investment_payments_select ON public.investment_payments;
CREATE POLICY investment_payments_select ON public.investment_payments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS investment_payments_insert ON public.investment_payments;
CREATE POLICY investment_payments_insert ON public.investment_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS investment_payments_update ON public.investment_payments;
CREATE POLICY investment_payments_update ON public.investment_payments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS investment_payments_delete ON public.investment_payments;
CREATE POLICY investment_payments_delete ON public.investment_payments
  FOR DELETE USING (user_id = auth.uid());
