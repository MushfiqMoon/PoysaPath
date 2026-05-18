"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { expenseInputSchema, type ExpenseInput } from "@/lib/validators";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in.");
  }

  return { supabase, user };
}

function revalidateExpensePages() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/add");
}

export async function createExpense(input: ExpenseInput) {
  const parsed = expenseInputSchema.parse(input);
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: parsed.amount,
    category_id: parsed.category_id,
    expense_date: parsed.expense_date,
    note: parsed.note?.trim() || null,
    payment_method: parsed.payment_method ?? null,
  });

  if (error) throw new Error(error.message);
  revalidateExpensePages();
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const parsed = expenseInputSchema.parse(input);
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("expenses")
    .update({
      amount: parsed.amount,
      category_id: parsed.category_id,
      expense_date: parsed.expense_date,
      note: parsed.note?.trim() || null,
      payment_method: parsed.payment_method ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateExpensePages();
}

export async function deleteExpense(id: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateExpensePages();
}
