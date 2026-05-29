-- Link recorded recurring payments to expenses and goal contributions.
-- Deleting an expense CASCADE-deletes its linked contribution.

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS recurring_item_id uuid REFERENCES public.recurring_items (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurring_paid_due_date date;

CREATE INDEX IF NOT EXISTS idx_expenses_recurring_item
  ON public.expenses (recurring_item_id)
  WHERE recurring_item_id IS NOT NULL;

COMMENT ON COLUMN public.expenses.recurring_item_id IS
  'Set when this expense was created via Record payment on a recurring item.';
COMMENT ON COLUMN public.expenses.recurring_paid_due_date IS
  'Due cycle that was paid; used to revert recurring next_due_date on expense delete.';

ALTER TABLE public.financial_goal_contributions
  ADD COLUMN IF NOT EXISTS expense_id uuid REFERENCES public.expenses (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_financial_goal_contributions_expense
  ON public.financial_goal_contributions (expense_id)
  WHERE expense_id IS NOT NULL;

COMMENT ON COLUMN public.financial_goal_contributions.expense_id IS
  'Set when this contribution was created from a recorded recurring payment.';
