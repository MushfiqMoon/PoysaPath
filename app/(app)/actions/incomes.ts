"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import { incomeInputSchema, type IncomeInput } from "@/lib/validators";

function revalidateIncomePages() {
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/add");
}

async function assertIncomeCategory(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >,
  userId: string,
  categoryId: string,
) {
  const { data: category, error } = await supabase
    .from("categories")
    .select("kind")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!category) throw new Error("Category not found.");
  if (category.kind !== "income") {
    throw new Error("Pick an income category.");
  }
}

export async function createIncome(input: IncomeInput) {
  const parsed = incomeInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  await assertIncomeCategory(supabase, user.id, parsed.category_id);

  const { error } = await supabase.from("incomes").insert({
    user_id: user.id,
    amount: parsed.amount,
    category_id: parsed.category_id,
    income_date: parsed.income_date,
    note: parsed.note?.trim() || null,
    payment_method: parsed.payment_method ?? null,
  });

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 022_incomes.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  revalidateIncomePages();
}

export async function updateIncome(id: string, input: IncomeInput) {
  const parsed = incomeInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  await assertIncomeCategory(supabase, user.id, parsed.category_id);

  const { error } = await supabase
    .from("incomes")
    .update({
      amount: parsed.amount,
      category_id: parsed.category_id,
      income_date: parsed.income_date,
      note: parsed.note?.trim() || null,
      payment_method: parsed.payment_method ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateIncomePages();
}

export async function deleteIncome(id: string) {
  const { supabase, user } = await requireActionUser();

  const { error } = await supabase
    .from("incomes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateIncomePages();
}
