import { getMonthStartInDhaka } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { FinancialGoal, FinancialGoalContribution } from "@/lib/types";

type GoalRow = {
  id: string;
  title: string;
  goal_type: FinancialGoal["goal_type"];
  category_id: string | null;
  target_amount: number;
  current_amount: number;
  target_month: string | null;
  due_date: string | null;
  status: FinancialGoal["status"];
  show_on_dashboard: boolean;
  created_at: string;
  categories:
    | { name: string; icon: string | null }
    | { name: string; icon: string | null }[]
    | null;
};

type GoalContributionRow = {
  id: string;
  goal_id: string;
  amount: number;
  created_at: string;
};

function getNextMonth(monthStart: string) {
  const [y, m] = monthStart.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

export async function getFinancialGoals(): Promise<FinancialGoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financial_goals")
    .select(
      "id, title, goal_type, category_id, target_amount, current_amount, target_month, due_date, status, show_on_dashboard, created_at, categories(name, icon)",
    )
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const goals = (data ?? []) as GoalRow[];
  const contributionsByGoal = new Map<string, FinancialGoalContribution[]>();
  const manualGoalIds = goals
    .filter((goal) => goal.goal_type !== "category_challenge")
    .map((goal) => goal.id);

  if (manualGoalIds.length > 0) {
    const { data: contributionData, error: contributionError } = await supabase
      .from("financial_goal_contributions")
      .select("id, goal_id, amount, created_at")
      .in("goal_id", manualGoalIds)
      .order("created_at", { ascending: false });

    if (contributionError) {
      if (contributionError.code !== "42P01") {
        throw new Error(contributionError.message);
      }
    } else {
      for (const contribution of (contributionData ?? []) as GoalContributionRow[]) {
        const rows = contributionsByGoal.get(contribution.goal_id) ?? [];
        rows.push({
          id: contribution.id,
          goal_id: contribution.goal_id,
          amount: Number(contribution.amount),
          created_at: contribution.created_at,
        });
        contributionsByGoal.set(contribution.goal_id, rows);
      }
    }
  }

  const challengeGoals = goals.filter(
    (goal) => goal.goal_type === "category_challenge" && goal.category_id,
  );
  const spentByGoal = new Map<string, number>();

  await Promise.all(
    challengeGoals.map(async (goal) => {
      const monthStart = goal.target_month ?? getMonthStartInDhaka();
      const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select("amount")
        .eq("category_id", goal.category_id)
        .gte("expense_date", monthStart)
        .lt("expense_date", getNextMonth(monthStart));

      if (expenseError) throw new Error(expenseError.message);
      spentByGoal.set(
        goal.id,
        (expenses ?? []).reduce((sum, row) => sum + Number(row.amount), 0),
      );
    }),
  );

  return goals.map((goal) => {
    const category = Array.isArray(goal.categories)
      ? (goal.categories[0] ?? null)
      : goal.categories;
    const target = Number(goal.target_amount);
    const progress =
      goal.goal_type === "category_challenge"
        ? (spentByGoal.get(goal.id) ?? 0)
        : Number(goal.current_amount);
    const percent = target > 0 ? Math.round((progress / target) * 100) : 0;
    const isChallenge = goal.goal_type === "category_challenge";

    return {
      id: goal.id,
      title: goal.title,
      goal_type: goal.goal_type,
      category_id: goal.category_id,
      target_amount: target,
      current_amount: Number(goal.current_amount),
      target_month: goal.target_month,
      due_date: goal.due_date,
      status: goal.status,
      show_on_dashboard: goal.show_on_dashboard,
      created_at: goal.created_at,
      category,
      progress_amount: progress,
      progress_percent: isChallenge ? Math.min(100, percent) : Math.min(100, percent),
      remaining_amount: Math.max(0, target - progress),
      is_over_target: isChallenge && progress > target,
      contributions: contributionsByGoal.get(goal.id) ?? [],
    };
  });
}

export async function getDashboardGoals(limit?: number): Promise<FinancialGoal[]> {
  const goals = await getFinancialGoals();
  const dashboardGoals = goals
    .filter((goal) => goal.status === "active" && goal.show_on_dashboard)
    .sort((a, b) => {
      if (a.is_over_target !== b.is_over_target) return a.is_over_target ? -1 : 1;
      return b.progress_percent - a.progress_percent;
    });

  return typeof limit === "number" ? dashboardGoals.slice(0, limit) : dashboardGoals;
}
