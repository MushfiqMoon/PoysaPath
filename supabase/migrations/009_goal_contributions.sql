-- Phase 5: contribution history for financial goals

CREATE TABLE IF NOT EXISTS public.financial_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.financial_goals (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_goal_contributions_goal_created
  ON public.financial_goal_contributions (goal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_goal_contributions_user_created
  ON public.financial_goal_contributions (user_id, created_at DESC);

-- Preserve existing manual progress as a first contribution before the sync
-- trigger is installed, so totals are not doubled during migration.
INSERT INTO public.financial_goal_contributions (goal_id, user_id, amount, created_at)
SELECT id, user_id, current_amount, created_at
FROM public.financial_goals goal
WHERE goal.goal_type <> 'category_challenge'
  AND goal.current_amount > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.financial_goal_contributions contribution
    WHERE contribution.goal_id = goal.id
  );

CREATE OR REPLACE FUNCTION public.sync_financial_goal_contribution_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.financial_goals
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.goal_id
      AND user_id = NEW.user_id
      AND goal_type <> 'category_challenge';

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.financial_goals
    SET current_amount = GREATEST(0, current_amount - OLD.amount)
    WHERE id = OLD.goal_id
      AND user_id = OLD.user_id
      AND goal_type <> 'category_challenge';

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS financial_goal_contributions_sync_total_insert
  ON public.financial_goal_contributions;
CREATE TRIGGER financial_goal_contributions_sync_total_insert
  AFTER INSERT ON public.financial_goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_financial_goal_contribution_total();

DROP TRIGGER IF EXISTS financial_goal_contributions_sync_total_delete
  ON public.financial_goal_contributions;
CREATE TRIGGER financial_goal_contributions_sync_total_delete
  AFTER DELETE ON public.financial_goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_financial_goal_contribution_total();

ALTER TABLE public.financial_goal_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own goal contributions"
  ON public.financial_goal_contributions;
CREATE POLICY "Users read own goal contributions"
  ON public.financial_goal_contributions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own goal contributions"
  ON public.financial_goal_contributions;
CREATE POLICY "Users insert own goal contributions"
  ON public.financial_goal_contributions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.financial_goals goal
      WHERE goal.id = financial_goal_contributions.goal_id
        AND goal.user_id = auth.uid()
        AND goal.goal_type <> 'category_challenge'
    )
  );

DROP POLICY IF EXISTS "Users delete own goal contributions"
  ON public.financial_goal_contributions;
CREATE POLICY "Users delete own goal contributions"
  ON public.financial_goal_contributions FOR DELETE
  USING (user_id = auth.uid());
