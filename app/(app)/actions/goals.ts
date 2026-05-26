"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  financialGoalInputSchema,
  type FinancialGoalInput,
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

function revalidateGoalPages() {
  revalidatePath("/dashboard");
  revalidatePath("/settings/goals");
}

export async function createFinancialGoal(input: FinancialGoalInput) {
  const parsed = financialGoalInputSchema.parse(input);
  const { supabase, user } = await requireUser();

  const isChallenge = parsed.goal_type === "category_challenge";
  const initialAmount = isChallenge ? 0 : (parsed.current_amount ?? 0);
  const { data: goal, error } = await supabase
    .from("financial_goals")
    .insert({
      user_id: user.id,
      title: parsed.title,
      goal_type: parsed.goal_type,
      category_id: isChallenge ? parsed.category_id : null,
      target_amount: parsed.target_amount,
      current_amount: 0,
      target_month: isChallenge ? parsed.target_month : null,
      due_date: isChallenge ? null : (parsed.due_date ?? null),
      show_on_dashboard: parsed.show_on_dashboard,
    })
    .select("id")
    .single();

  if (error || !goal) {
    if (error?.code === "42P01") {
      throw new Error("Run migration 007_goals_recurring.sql in Supabase.");
    }
    throw new Error(error?.message ?? "Could not create goal.");
  }

  if (!isChallenge && initialAmount > 0) {
    const { error: contributionError } = await supabase
      .from("financial_goal_contributions")
      .insert({ goal_id: goal.id, user_id: user.id, amount: initialAmount });

    if (contributionError) {
      await supabase
        .from("financial_goals")
        .delete()
        .eq("id", goal.id)
        .eq("user_id", user.id);

      if (contributionError.code === "42P01") {
        throw new Error("Run migration 009_goal_contributions.sql in Supabase.");
      }
      throw new Error(contributionError.message);
    }
  }

  revalidateGoalPages();
}

export async function addFinancialGoalContribution(id: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than 0.");
  }
  const { supabase, user } = await requireUser();

  const { data: goal, error: goalError } = await supabase
    .from("financial_goals")
    .select("goal_type, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goal) {
    throw new Error(goalError?.message ?? "Could not find goal.");
  }
  if (goal.goal_type === "category_challenge") {
    throw new Error("Spend-less challenges update from expenses automatically.");
  }
  if (goal.status === "completed") {
    throw new Error("Completed goals cannot receive new contributions.");
  }

  const { error } = await supabase
    .from("financial_goal_contributions")
    .insert({ goal_id: id, user_id: user.id, amount });

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 009_goal_contributions.sql in Supabase.");
    }
    throw new Error(error.message);
  }
  revalidateGoalPages();
}

export async function deleteFinancialGoalContribution(id: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("financial_goal_contributions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 009_goal_contributions.sql in Supabase.");
    }
    throw new Error(error.message);
  }
  revalidateGoalPages();
}

export async function completeFinancialGoal(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_goals")
    .update({ status: "completed", show_on_dashboard: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateGoalPages();
}

export async function updateFinancialGoalDashboardVisibility(
  id: string,
  showOnDashboard: boolean,
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_goals")
    .update({ show_on_dashboard: showOnDashboard })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateGoalPages();
}

export async function deleteFinancialGoal(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("financial_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateGoalPages();
}
