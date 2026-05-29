# Recurring ↔ Goals roadmap

Link recurring payment reminders to financial goals so recording a payment updates both spending and savings progress.

## User story

Example: save ৳100,000 with a goal, and set a recurring ৳10,000/month payment linked to that goal. Each time **Record payment** is tapped:

1. An **expense** is created (unchanged behavior).
2. A **goal contribution** is added when `linked_goal_id` is set (Option B).

Creating a recurring row alone does not touch expenses or goals until payment is recorded.

---

## Phase 1 — Link on create + record (shipped)

**Database:** `012_recurring_goal_link.sql` — `recurring_items.linked_goal_id`

**Server:** `createRecurringItem`, `recordRecurringExpense` with goal contribution

**UI:** Link on create, badges on cards

---

## Data integrity — linked IDs + cascade (shipped)

**Database:** `013_recurring_expense_goal_links.sql`

| Column | Table | Purpose |
|--------|-------|---------|
| `recurring_item_id` | `expenses` | Which recurring created this expense |
| `recurring_paid_due_date` | `expenses` | Due cycle paid; used to revert schedule |
| `expense_id` | `financial_goal_contributions` | Links contribution to expense; `ON DELETE CASCADE` |

### Delete behavior

| Action | Result |
|--------|--------|
| **Delete expense** (from recurring record) | Linked contribution removed (CASCADE); goal `current_amount` updated by trigger; `next_due_date` reverted **only if** this was the latest recorded cycle |
| **Delete recurring template** | Expenses kept; `recurring_item_id` set NULL |
| **Delete goal** | Contributions CASCADE; recurring `linked_goal_id` SET NULL |
| **Delete contribution in Goals** | Blocked when `expense_id` is set — delete the expense instead |

Manual expenses and manual goal top-ups have null link columns (unchanged).

Pre-migration rows stay unlinked.

---

## Phase 2 — Deferred

- Edit goal link on existing recurring
- Custom amount at record
- Idempotency on double-tap Record payment

---

## Phase 3 — Discovery & dashboard

- Projected goal completion from recurring amount + frequency
- Dashboard “next savings installment”
- Shortcut from Goals: add linked recurring
- Due notifications

---

## Phase 4 — Advanced

- Multiple recurring → one goal
- Auto-complete goal at 100%
- Optional undo / audit UI for linked payments

---

## Rules

| Goal type | Can link? | On record |
|-----------|-----------|-----------|
| Savings, emergency, debt payoff | Yes | Expense + contribution |
| Spend-less challenge | No | Progress from category expenses |
| Completed / paused goal | No | Blocked at validate time |

**Deploy:** Run migrations `012` and `013` in Supabase.
