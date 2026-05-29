"use server";

import { revalidatePath } from "next/cache";

import { advanceDueDate } from "@/lib/recurring-dates";
import type { RecurringFrequency } from "@/lib/recurring-dates";
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
  revalidatePath("/settings/goals");
  revalidatePath("/settings/recurring");
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

  const { data: expense, error: fetchError } = await supabase
    .from("expenses")
    .select("recurring_item_id, recurring_paid_due_date")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    if (fetchError.code === "42703") {
      throw new Error("Run migration 013_recurring_expense_goal_links.sql in Supabase.");
    }
    throw new Error(fetchError.message);
  }
  if (!expense) throw new Error("Expense not found.");

  let revertDueDate:
    | { recurringId: string; paidDueDate: string; frequency: RecurringFrequency }
    | null = null;

  if (expense.recurring_item_id && expense.recurring_paid_due_date) {
    const { data: recurring, error: recurringError } = await supabase
      .from("recurring_items")
      .select("next_due_date, frequency")
      .eq("id", expense.recurring_item_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (recurringError) throw new Error(recurringError.message);

    if (recurring) {
      const paidDueDate = expense.recurring_paid_due_date as string;
      const frequency = recurring.frequency as RecurringFrequency;
      const expectedNext = advanceDueDate(paidDueDate, frequency);

      if (recurring.next_due_date === expectedNext) {
        revertDueDate = {
          recurringId: expense.recurring_item_id,
          paidDueDate,
          frequency,
        };
      }
    }
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  if (revertDueDate) {
    const { error: revertError } = await supabase
      .from("recurring_items")
      .update({ next_due_date: revertDueDate.paidDueDate })
      .eq("id", revertDueDate.recurringId)
      .eq("user_id", user.id);

    if (revertError) throw new Error(revertError.message);
  }

  revalidateExpensePages();
}
