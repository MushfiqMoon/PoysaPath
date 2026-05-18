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
