"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import { isValidCategoryIcon } from "@/lib/category-icon";
import type { CategoryKind } from "@/lib/types";

function revalidateCategoryPaths() {
  revalidatePath("/settings/categories");
  revalidatePath("/add");
  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/settings/budgets");
}

function normalizeIcon(icon?: string | null) {
  const trimmed = icon?.trim() || "";
  if (!trimmed) return null;
  if (!isValidCategoryIcon(trimmed)) {
    throw new Error("Icon must be at most 2 characters or one emoji.");
  }
  return trimmed;
}

export async function createCategory(
  name: string,
  icon?: string | null,
  kind: CategoryKind = "expense",
) {
  const trimmed = name.trim();
  if (trimmed.length < 1) throw new Error("Category name is required.");

  const { supabase, user } = await requireActionUser();

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("user_id", user.id)
    .eq("kind", kind)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: trimmed,
    icon: normalizeIcon(icon),
    sort_order: sortOrder,
    kind,
  });

  if (error) throw new Error(error.message);
  revalidateCategoryPaths();
}

export async function updateCategory(
  id: string,
  name: string,
  icon?: string | null,
) {
  const trimmed = name.trim();
  if (trimmed.length < 1) throw new Error("Category name is required.");

  const { supabase } = await requireActionUser();

  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed, icon: normalizeIcon(icon) })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateCategoryPaths();
}

export async function getCategoryExpenseCount(categoryId: string) {
  const { supabase } = await requireActionUser();

  const { count, error } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getCategoryIncomeCount(categoryId: string) {
  const { supabase } = await requireActionUser();

  const { count, error } = await supabase
    .from("incomes")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 022_incomes.sql in Supabase.");
    }
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function deleteCategory(
  id: string,
  reassignToId?: string,
  kind: CategoryKind = "expense",
) {
  const { supabase } = await requireActionUser();
  const table = kind === "income" ? "incomes" : "expenses";

  const { count, error: countError } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) throw new Error(countError.message);

  if (count && count > 0) {
    if (!reassignToId) {
      throw new Error("REASSIGN_REQUIRED");
    }
    if (reassignToId === id) {
      throw new Error(
        kind === "income"
          ? "Choose a different category to reassign income."
          : "Choose a different category to reassign expenses.",
      );
    }

    const { error: moveError } = await supabase
      .from(table)
      .update({ category_id: reassignToId })
      .eq("category_id", id);

    if (moveError) throw new Error(moveError.message);
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidateCategoryPaths();
}
