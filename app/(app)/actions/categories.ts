"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

function revalidateCategoryPaths() {
  revalidatePath("/categories");
  revalidatePath("/add");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
}

export async function createCategory(name: string, icon?: string | null) {
  const trimmed = name.trim();
  if (trimmed.length < 1) throw new Error("Category name is required.");

  const { supabase, user } = await requireUser();

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: trimmed,
    icon: icon?.trim() || null,
    sort_order: sortOrder,
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

  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed, icon: icon?.trim() || null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateCategoryPaths();
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireUser();

  const { count, error: countError } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) throw new Error(countError.message);
  if (count && count > 0) {
    throw new Error("Cannot delete a category that has expenses.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidateCategoryPaths();
}
