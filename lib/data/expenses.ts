import { getMonthStartInDhaka, getTodayInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { CategoryTotal, Expense } from "@/lib/types";

const expenseSelect =
  "id, amount, category_id, expense_date, note, payment_method, created_at, categories(name, icon)";

function normalizeExpense(row: {
  id: string;
  amount: number;
  category_id: string;
  expense_date: string;
  note: string | null;
  payment_method: string | null;
  created_at: string;
  categories:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
}): Expense {
  const categories = Array.isArray(row.categories)
    ? (row.categories[0] ?? null)
    : row.categories;

  return { ...row, categories };
}

export async function getExpenses(options?: {
  categoryId?: string;
  monthStart?: string;
}): Promise<Expense[]> {
  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select(expenseSelect)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.monthStart) {
    const [y, m] = options.monthStart.split("-").map(Number);
    const nextMonth =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query
      .gte("expense_date", options.monthStart)
      .lt("expense_date", nextMonth);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeExpense(row));
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(expenseSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeExpense(data) : null;
}

export async function getRecentExpenses(limit = 5): Promise<Expense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(expenseSelect)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeExpense(row));
}

export async function getTodayTotal(): Promise<number> {
  const supabase = await createClient();
  const today = getTodayInDhaka();
  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("expense_date", today);

  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function getMonthTotal(): Promise<number> {
  const monthStart = getMonthStartInDhaka();
  const expenses = await getExpenses({ monthStart });
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export async function getMonthCategoryTotals(): Promise<CategoryTotal[]> {
  const expenses = await getExpenses({ monthStart: getMonthStartInDhaka() });
  const map = new Map<string, CategoryTotal>();

  for (const e of expenses) {
    const existing = map.get(e.category_id);
    const amount = Number(e.amount);
    if (existing) {
      existing.total += amount;
    } else {
      map.set(e.category_id, {
        category_id: e.category_id,
        name: e.categories?.name ?? "Other",
        icon: e.categories?.icon ?? null,
        total: amount,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}
