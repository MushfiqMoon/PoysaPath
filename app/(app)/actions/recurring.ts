"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  recurringItemInputSchema,
  type RecurringItemInput,
} from "@/lib/validators";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("You must be logged in.");
  return { supabase, user };
}

function revalidateRecurringPages() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/settings/recurring");
}

function advanceDueDate(ymd: string, frequency: "weekly" | "monthly" | "yearly") {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  if (frequency === "weekly") {
    date.setUTCDate(date.getUTCDate() + 7);
  } else if (frequency === "monthly") {
    date.setUTCMonth(date.getUTCMonth() + 1);
  } else {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  }

  return date.toISOString().slice(0, 10);
}

export async function createRecurringItem(input: RecurringItemInput) {
  const parsed = recurringItemInputSchema.parse(input);
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("recurring_items").insert({
    user_id: user.id,
    title: parsed.title,
    recurring_type: "expense",
    amount: parsed.amount,
    category_id: parsed.category_id,
    payment_method: parsed.payment_method ?? null,
    frequency: parsed.frequency,
    next_due_date: parsed.next_due_date,
    reminder_days: parsed.reminder_days,
    notes: parsed.notes?.trim() || null,
  });

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 007_goals_recurring.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  revalidateRecurringPages();
}

export async function recordRecurringExpense(id: string) {
  const { supabase, user } = await requireUser();
  const { data: item, error: itemError } = await supabase
    .from("recurring_items")
    .select(
      "id, title, recurring_type, amount, category_id, payment_method, frequency, next_due_date",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (itemError) throw new Error(itemError.message);
  if (!item) throw new Error("Recurring item not found.");
  if (item.recurring_type !== "expense" || !item.category_id) {
    throw new Error("Only recurring expenses can be recorded as expenses.");
  }

  const { error: expenseError } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: Number(item.amount),
    category_id: item.category_id,
    expense_date: item.next_due_date,
    note: item.title,
    payment_method: item.payment_method,
  });

  if (expenseError) throw new Error(expenseError.message);

  const { error: updateError } = await supabase
    .from("recurring_items")
    .update({
      next_due_date: advanceDueDate(item.next_due_date, item.frequency),
      last_recorded_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) throw new Error(updateError.message);
  revalidateRecurringPages();
}

export async function deleteRecurringItem(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("recurring_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateRecurringPages();
}
