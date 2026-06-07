import { getMonthStartInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { unwrapSupabaseJoin } from "@/lib/supabase/normalize";
import type { Income } from "@/lib/types";

const incomeSelect =
  "id, amount, category_id, income_date, note, payment_method, created_at, categories(name, icon)";

function normalizeIncome(row: {
  id: string;
  amount: number;
  category_id: string;
  income_date: string;
  note: string | null;
  payment_method: string | null;
  created_at: string;
  categories:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
}): Income {
  const categories = unwrapSupabaseJoin(row.categories);

  return {
    id: row.id,
    amount: row.amount,
    category_id: row.category_id,
    income_date: row.income_date,
    note: row.note,
    payment_method: row.payment_method,
    created_at: row.created_at,
    categories,
  };
}

export async function getEarliestIncomeMonthStart(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incomes")
    .select("income_date")
    .order("income_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.income_date) return null;

  const [y, m] = data.income_date.split("-");
  return `${y}-${m}-01`;
}

export async function getIncomes(options?: {
  categoryId?: string;
  paymentMethod?: string;
  monthStart?: string;
}): Promise<Income[]> {
  const supabase = await createClient();
  let query = supabase
    .from("incomes")
    .select(incomeSelect)
    .order("income_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.paymentMethod) {
    query = query.eq("payment_method", options.paymentMethod);
  }

  if (options?.monthStart) {
    const [y, m] = options.monthStart.split("-").map(Number);
    const nextMonth =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query
      .gte("income_date", options.monthStart)
      .lt("income_date", nextMonth);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeIncome(row));
}

export async function getIncomeById(id: string): Promise<Income | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incomes")
    .select(incomeSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeIncome(data) : null;
}

export async function getRecentIncomes(limit = 5): Promise<Income[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("incomes")
    .select(incomeSelect)
    .order("income_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeIncome(row));
}

export async function getMonthIncomeTotal(): Promise<number> {
  const monthStart = getMonthStartInDhaka();
  const incomes = await getIncomes({ monthStart });
  return incomes.reduce((sum, row) => sum + Number(row.amount), 0);
}
