export type CategoryKind = "expense" | "income";

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  kind: CategoryKind;
};

export type Income = {
  id: string;
  amount: number;
  category_id: string;
  income_date: string;
  note: string | null;
  payment_method: string | null;
  created_at: string;
  categories: Pick<Category, "name" | "icon"> | null;
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

export type BellNotification = Notification & {
  source: "announcement" | "recurring" | "shared_reminder";
  href?: string;
};

export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "removed";

export type ConnectionProfilePreview = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type ConnectionRequest = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  created_at: string;
  responded_at: string | null;
  other_user: ConnectionProfilePreview;
};

export type ConnectedContact = {
  connection_id: string;
  user: ConnectionProfilePreview;
  connected_at: string;
};

export type ConnectionSearchResult = {
  user: ConnectionProfilePreview;
  canInvite: boolean;
  statusMessage: string | null;
};

export type SharedReminderStatus = "open" | "done" | "cancelled";

export type SharedReminder = {
  id: string;
  creator_id: string;
  assignee_id: string;
  title: string;
  note: string | null;
  due_at: string | null;
  status: SharedReminderStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: string | null;
  creator: ConnectionProfilePreview;
  assignee: ConnectionProfilePreview;
};

export type InboxNotificationKind =
  | "shared_reminder_assigned"
  | "shared_reminder_done";

export type InboxNotification = {
  id: string;
  user_id: string;
  shared_reminder_id: string | null;
  kind: InboxNotificationKind;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type RecurringAlertKind = "due_soon" | "missed";

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

/** Investment projects at /settings/investments. Future: StockTrade for stock_trades table. */
export type InvestmentKind = "one_time" | "multi_payment";
export type InvestmentProjectStatus = "active" | "completed";

export type InvestmentPayment = {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
};

export type InvestmentProject = {
  id: string;
  title: string;
  description: string | null;
  kind: InvestmentKind;
  target_amount: number | null;
  status: InvestmentProjectStatus;
  created_at: string;
  updated_at: string;
  payments: InvestmentPayment[];
  paid_total: number;
  progress_percent: number;
};
