-- Backfill recurring-recorded expenses: expense_date is the log day, not the due cycle.
-- recurring_paid_due_date (unchanged) stores which billing cycle was paid for delete revert.

UPDATE public.expenses
SET expense_date = (created_at AT TIME ZONE 'Asia/Dhaka')::date
WHERE recurring_item_id IS NOT NULL
  AND recurring_paid_due_date IS NOT NULL;

COMMENT ON COLUMN public.expenses.expense_date IS
  'Calendar day shown in the expense log; for recurring records, this is the record day, not the due cycle.';
COMMENT ON COLUMN public.expenses.recurring_paid_due_date IS
  'Due cycle that was paid when recording a recurring payment; used to revert recurring next_due_date on expense delete.';
