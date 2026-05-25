-- Simplify recurring items to payment reminders.
-- Existing legacy income reminders are preserved, but new rows must be expenses.

ALTER TABLE public.recurring_items
  ALTER COLUMN recurring_type SET DEFAULT 'expense';

ALTER TABLE public.recurring_items
  DROP CONSTRAINT IF EXISTS recurring_items_expense_only_check;

ALTER TABLE public.recurring_items
  ADD CONSTRAINT recurring_items_expense_only_check
  CHECK (recurring_type = 'expense') NOT VALID;

COMMENT ON COLUMN public.recurring_items.recurring_type IS
  'Legacy discriminator retained for existing rows; new recurring items are expense payment reminders.';
