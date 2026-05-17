import { getMonthStartInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { BudgetRow } from "@/lib/types";

export async function getBudgetsWithSpent(
  monthStart = getMonthStartInDhaka(),
): Promise<BudgetRow[]> {
  const supabase = await createClient();
  const [y, m] = monthStart.split("-").map(Number);
  const nextMonth =
    m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data: budgets, error: budgetError } = await supabase
    .from("budgets")
    .select("id, category_id, month, amount, categories(name, icon)")
    .eq("month", monthStart)
    .order("amount", { ascending: false });

  if (budgetError) {
    if (budgetError.code === "42P01") return [];
    throw new Error(budgetError.message);
  }

  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("category_id, amount")
    .gte("expense_date", monthStart)
    .lt("expense_date", nextMonth);

  if (expenseError) throw new Error(expenseError.message);

  const spentByCategory = new Map<string, number>();
  for (const e of expenses ?? []) {
    const id = e.category_id as string;
    spentByCategory.set(id, (spentByCategory.get(id) ?? 0) + Number(e.amount));
  }

  return (budgets ?? []).map((b) => {
    const cat = b.categories as
      | { name: string; icon: string | null }
      | { name: string; icon: string | null }[]
      | null;
    const category = Array.isArray(cat) ? cat[0] : cat;
    return {
      id: b.id,
      category_id: b.category_id,
      month: b.month,
      amount: Number(b.amount),
      category: {
        name: category?.name ?? "Category",
        icon: category?.icon ?? null,
      },
      spent: spentByCategory.get(b.category_id) ?? 0,
    };
  });
}

export async function getCategoriesWithoutBudget(
  monthStart = getMonthStartInDhaka(),
) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon")
    .not("user_id", "is", null)
    .order("sort_order");

  const budgets = await getBudgetsWithSpent(monthStart);
  const budgeted = new Set(budgets.map((b) => b.category_id));

  return (categories ?? []).filter((c) => !budgeted.has(c.id));
}
