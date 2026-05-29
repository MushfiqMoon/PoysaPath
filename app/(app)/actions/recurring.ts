"use server";

import { revalidatePath } from "next/cache";

import { advanceDueDate } from "@/lib/recurring-dates";
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
  revalidatePath("/settings/goals");
}

async function assertLinkableGoal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  goalId: string,
) {
  const { data: goal, error } = await supabase
    .from("financial_goals")
    .select("goal_type, status")
    .eq("id", goalId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!goal) throw new Error("Linked goal not found.");
  if (goal.goal_type === "category_challenge") {
    throw new Error("Spend-less challenges cannot be linked to recurring payments.");
  }
  if (goal.status !== "active") {
    throw new Error("Only active goals can be linked to recurring payments.");
  }
}

async function addGoalContributionFromRecurring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  goalId: string,
  amount: number,
  expenseId: string,
) {
  await assertLinkableGoal(supabase, userId, goalId);

  const { error } = await supabase.from("financial_goal_contributions").insert({
    goal_id: goalId,
    user_id: userId,
    amount,
    expense_id: expenseId,
  });

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 009_goal_contributions.sql in Supabase.");
    }
    if (error.code === "42703") {
      throw new Error("Run migration 013_recurring_expense_goal_links.sql in Supabase.");
    }
    throw new Error(error.message);
  }
}

export async function createRecurringItem(input: RecurringItemInput) {
  const parsed = recurringItemInputSchema.parse(input);
  const { supabase, user } = await requireUser();

  if (parsed.linked_goal_id) {
    await assertLinkableGoal(supabase, user.id, parsed.linked_goal_id);
  }

  const { error } = await supabase.from("recurring_items").insert({
    user_id: user.id,
    title: parsed.title,
    recurring_type: "expense",
    amount: parsed.amount,
    category_id: parsed.category_id,
    linked_goal_id: parsed.linked_goal_id,
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
    if (error.code === "42703") {
      throw new Error("Run migration 012_recurring_goal_link.sql in Supabase.");
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
      "id, title, recurring_type, amount, category_id, linked_goal_id, payment_method, frequency, next_due_date",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (itemError) {
    if (itemError.code === "42703") {
      throw new Error("Run migration 012_recurring_goal_link.sql in Supabase.");
    }
    throw new Error(itemError.message);
  }
  if (!item) throw new Error("Recurring item not found.");
  if (item.recurring_type !== "expense" || !item.category_id) {
    throw new Error("Only recurring expenses can be recorded as expenses.");
  }

  const amount = Number(item.amount);
  const linkedGoalId = item.linked_goal_id as string | null;
  const paidDueDate = item.next_due_date;

  if (linkedGoalId) {
    await assertLinkableGoal(supabase, user.id, linkedGoalId);
  }

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount,
      category_id: item.category_id,
      expense_date: paidDueDate,
      note: item.title,
      payment_method: item.payment_method,
      recurring_item_id: item.id,
      recurring_paid_due_date: paidDueDate,
    })
    .select("id")
    .single();

  if (expenseError) {
    if (expenseError.code === "42703") {
      throw new Error("Run migration 013_recurring_expense_goal_links.sql in Supabase.");
    }
    throw new Error(expenseError.message);
  }
  if (!expense) throw new Error("Could not create expense.");

  if (linkedGoalId) {
    await addGoalContributionFromRecurring(
      supabase,
      user.id,
      linkedGoalId,
      amount,
      expense.id,
    );
  }

  const { error: updateError } = await supabase
    .from("recurring_items")
    .update({
      next_due_date: advanceDueDate(paidDueDate, item.frequency),
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
