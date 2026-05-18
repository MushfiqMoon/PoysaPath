"use server";

import { revalidatePath } from "next/cache";

import { getMonthStartInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  return { supabase, user };
}

export async function upsertBudget(categoryId: string, amount: number) {
  if (amount <= 0) throw new Error("Budget must be greater than zero.");

  const { supabase, user } = await requireUser();
  const month = getMonthStartInDhaka();

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_id: categoryId,
      month,
      amount,
    },
    { onConflict: "user_id,category_id,month" },
  );

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 004_budgets.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/settings/budget");
  revalidatePath("/dashboard");
}

export async function deleteBudget(id: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/budget");
}
