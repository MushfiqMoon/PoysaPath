import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryKind } from "@/lib/types";

export async function getUserCategories(options?: {
  kind?: CategoryKind;
}): Promise<Category[]> {
  const supabase = await createClient();
  const kind = options?.kind ?? "expense";
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, sort_order, kind")
    .not("user_id", "is", null)
    .eq("kind", kind)
    .order("sort_order");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    ...row,
    kind: (row.kind ?? "expense") as CategoryKind,
  }));
}

export async function getExpenseCategories(): Promise<Category[]> {
  return getUserCategories({ kind: "expense" });
}

export async function getIncomeCategories(): Promise<Category[]> {
  return getUserCategories({ kind: "income" });
}
