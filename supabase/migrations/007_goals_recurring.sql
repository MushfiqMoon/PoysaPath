-- Phase 4: financial goals and recurring money reminders

CREATE TABLE IF NOT EXISTS public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  goal_type text NOT NULL CHECK (
    goal_type IN ('savings', 'emergency', 'debt_payoff', 'category_challenge')
  ),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  target_amount numeric(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_month date,
  due_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_goals_user_status
  ON public.financial_goals (user_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_target_month
  ON public.financial_goals (user_id, target_month);

DROP TRIGGER IF EXISTS financial_goals_set_updated_at ON public.financial_goals;
CREATE TRIGGER financial_goals_set_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own financial goals" ON public.financial_goals;
CREATE POLICY "Users read own financial goals"
  ON public.financial_goals FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own financial goals" ON public.financial_goals;
CREATE POLICY "Users insert own financial goals"
  ON public.financial_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own financial goals" ON public.financial_goals;
CREATE POLICY "Users update own financial goals"
  ON public.financial_goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own financial goals" ON public.financial_goals;
CREATE POLICY "Users delete own financial goals"
  ON public.financial_goals FOR DELETE
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.recurring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  recurring_type text NOT NULL CHECK (recurring_type IN ('expense', 'income')),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  payment_method text,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  next_due_date date NOT NULL,
  reminder_days int NOT NULL DEFAULT 3 CHECK (reminder_days >= 0 AND reminder_days <= 30),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  last_recorded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_items_user_due
  ON public.recurring_items (user_id, is_active, next_due_date);

DROP TRIGGER IF EXISTS recurring_items_set_updated_at ON public.recurring_items;
CREATE TRIGGER recurring_items_set_updated_at
  BEFORE UPDATE ON public.recurring_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own recurring items" ON public.recurring_items;
CREATE POLICY "Users read own recurring items"
  ON public.recurring_items FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own recurring items" ON public.recurring_items;
CREATE POLICY "Users insert own recurring items"
  ON public.recurring_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own recurring items" ON public.recurring_items;
CREATE POLICY "Users update own recurring items"
  ON public.recurring_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own recurring items" ON public.recurring_items;
CREATE POLICY "Users delete own recurring items"
  ON public.recurring_items FOR DELETE
  USING (user_id = auth.uid());
