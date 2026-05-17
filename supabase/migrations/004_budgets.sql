-- Phase 3: monthly budgets per category

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE CASCADE,
  month date NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets (user_id, month);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own budgets" ON public.budgets;
CREATE POLICY "Users read own budgets"
  ON public.budgets FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own budgets" ON public.budgets;
CREATE POLICY "Users insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own budgets" ON public.budgets;
CREATE POLICY "Users update own budgets"
  ON public.budgets FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own budgets" ON public.budgets;
CREATE POLICY "Users delete own budgets"
  ON public.budgets FOR DELETE
  USING (user_id = auth.uid());
