export type Category = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

export type Expense = {
  id: string;
  amount: number;
  category_id: string;
  expense_date: string;
  note: string | null;
  payment_method: string | null;
  recurring_item_id: string | null;
  recurring_paid_due_date: string | null;
  created_at: string;
  categories: Pick<Category, "name" | "icon"> | null;
};

export type CategoryTotal = {
  category_id: string;
  name: string;
  icon: string | null;
  total: number;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  kind: string;
  created_at: string;
};

export type ReadNotification = Notification & {
  read_at: string;
};

export type UserNotificationRead = {
  user_id: string;
  notification_id: string;
  read_at: string;
};

export type BudgetRow = {
  id: string;
  category_id: string;
  month: string;
  amount: number;
  category: Pick<Category, "name" | "icon">;
  spent: number;
};

export type FinancialGoalType =
  | "savings"
  | "emergency"
  | "debt_payoff"
  | "category_challenge";

export type FinancialGoalStatus = "active" | "paused" | "completed";

export type FinancialGoalContribution = {
  id: string;
  goal_id: string;
  amount: number;
  expense_id: string | null;
  created_at: string;
};

export type FinancialGoal = {
  id: string;
  title: string;
  goal_type: FinancialGoalType;
  category_id: string | null;
  target_amount: number;
  current_amount: number;
  target_month: string | null;
  due_date: string | null;
  status: FinancialGoalStatus;
  show_on_dashboard: boolean;
  created_at: string;
  category: Pick<Category, "name" | "icon"> | null;
  progress_amount: number;
  progress_percent: number;
  remaining_amount: number;
  is_over_target: boolean;
  contributions: FinancialGoalContribution[];
};

export type RecurringType = "expense" | "income";
export type RecurringFrequency = "weekly" | "monthly" | "yearly";
export type RecurringStatus = "missed" | "due_soon" | "upcoming";

export type LinkableFinancialGoal = {
  id: string;
  title: string;
};

export type RecurringItem = {
  id: string;
  title: string;
  recurring_type: RecurringType;
  amount: number;
  category_id: string | null;
  linked_goal_id: string | null;
  payment_method: string | null;
  frequency: RecurringFrequency;
  next_due_date: string;
  reminder_days: number;
  notes: string | null;
  is_active: boolean;
  last_recorded_at: string | null;
  created_at: string;
  category: Pick<Category, "name" | "icon"> | null;
  linked_goal: LinkableFinancialGoal | null;
  status: RecurringStatus;
  days_until_due: number;
};
