import { addDaysYmd, getTodayInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { RecurringItem, RecurringStatus } from "@/lib/types";

type RecurringRow = Omit<
  RecurringItem,
  "amount" | "category" | "status" | "days_until_due"
> & {
  amount: number;
  categories:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

function diffDays(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = Date.UTC(fy, fm - 1, fd);
  const end = Date.UTC(ty, tm - 1, td);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function getStatus(daysUntilDue: number, reminderDays: number): RecurringStatus {
  if (daysUntilDue < 0) return "missed";
  if (daysUntilDue <= reminderDays) return "due_soon";
  return "upcoming";
}

export async function getRecurringItems(): Promise<RecurringItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_items")
    .select(
      "id, title, recurring_type, amount, category_id, payment_method, frequency, next_due_date, reminder_days, notes, is_active, last_recorded_at, created_at, categories(name, icon)",
    )
    .order("is_active", { ascending: false })
    .order("next_due_date", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const today = getTodayInDhaka();
  return ((data ?? []) as RecurringRow[]).map((row) => {
    const category = Array.isArray(row.categories)
      ? (row.categories[0] ?? null)
      : row.categories;
    const daysUntilDue = diffDays(today, row.next_due_date);

    return {
      id: row.id,
      title: row.title,
      recurring_type: row.recurring_type,
      amount: Number(row.amount),
      category_id: row.category_id,
      payment_method: row.payment_method,
      frequency: row.frequency,
      next_due_date: row.next_due_date,
      reminder_days: row.reminder_days,
      notes: row.notes,
      is_active: row.is_active,
      last_recorded_at: row.last_recorded_at,
      created_at: row.created_at,
      category,
      days_until_due: daysUntilDue,
      status: row.is_active
        ? getStatus(daysUntilDue, row.reminder_days)
        : "upcoming",
    };
  });
}

export async function getRecurringAlerts(limit = 3): Promise<RecurringItem[]> {
  const items = await getRecurringItems();
  const soonCutoff = addDaysYmd(getTodayInDhaka(), 7);
  return items
    .filter(
      (item) =>
        item.is_active &&
        (item.status === "missed" ||
          item.status === "due_soon" ||
          item.next_due_date <= soonCutoff),
    )
    .slice(0, limit);
}
