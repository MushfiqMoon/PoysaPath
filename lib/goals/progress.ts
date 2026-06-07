import { formatCurrency } from "@/lib/format";
import type { FinancialGoal } from "@/lib/types";

export type GoalProgressLabelStyle = "dashboard" | "settings";

export function getGoalProgressPercent(goal: FinancialGoal): number {
  return Math.min(100, goal.progress_percent);
}

export function isGoalChallenge(goal: FinancialGoal): boolean {
  return goal.goal_type === "category_challenge";
}

export function isAtChallengeLimit(goal: FinancialGoal): boolean {
  return (
    isGoalChallenge(goal) &&
    !goal.is_over_target &&
    goal.progress_percent >= 100
  );
}

export function getGoalProgressStatusLabel(
  goal: FinancialGoal,
  style: GoalProgressLabelStyle = "dashboard",
): string {
  const isChallenge = isGoalChallenge(goal);

  if (goal.is_over_target) {
    return `${formatCurrency(goal.progress_amount - goal.target_amount)} over target`;
  }

  if (isChallenge) {
    if (isAtChallengeLimit(goal)) return "At the limit";
    return `${formatCurrency(goal.remaining_amount)} left this month`;
  }

  return style === "dashboard"
    ? `${formatCurrency(goal.remaining_amount)} left`
    : `${formatCurrency(goal.remaining_amount)} remaining`;
}

export function getGoalProgressPercentLabel(
  goal: FinancialGoal,
  style: GoalProgressLabelStyle = "dashboard",
): string {
  const progress = getGoalProgressPercent(goal);

  if (style === "dashboard") {
    return isGoalChallenge(goal) ? `${progress}% used` : `${progress}%`;
  }

  return isGoalChallenge(goal)
    ? `${progress}% of limit used`
    : `${progress}% complete`;
}

export function getGoalProgressAmountClass(goal: FinancialGoal): string {
  if (goal.is_over_target) return "text-danger";
  if (isAtChallengeLimit(goal)) return "text-text-muted";
  return "text-accent";
}

export function getGoalProgressBadgeClass(goal: FinancialGoal): string {
  if (goal.is_over_target) return "bg-danger/10 text-danger";
  if (isAtChallengeLimit(goal)) return "bg-bg text-text-muted";
  return "bg-accent/10 text-accent";
}
