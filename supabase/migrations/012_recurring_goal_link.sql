-- Phase 1: link recurring payment reminders to financial goals.
-- Recording a payment still creates an expense; if linked_goal_id is set,
-- a row is also inserted into financial_goal_contributions.

ALTER TABLE public.recurring_items
  ADD COLUMN IF NOT EXISTS linked_goal_id uuid REFERENCES public.financial_goals (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recurring_items_linked_goal
  ON public.recurring_items (linked_goal_id)
  WHERE linked_goal_id IS NOT NULL;

COMMENT ON COLUMN public.recurring_items.linked_goal_id IS
  'Optional goal to credit when this recurring payment is recorded (not category_challenge).';
