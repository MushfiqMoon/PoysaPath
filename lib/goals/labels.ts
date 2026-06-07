import type { FinancialGoalType } from "@/lib/types";

export const GOAL_TYPE_LABELS_SHORT: Record<FinancialGoalType, string> = {
  savings: "Saving",
  debt_payoff: "Debt payoff",
  category_challenge: "Spend-less",
};

export const GOAL_TYPE_LABELS_LONG: Record<FinancialGoalType, string> = {
  savings: "Saving",
  debt_payoff: "Pay down debt",
  category_challenge: "Spend less in a category",
};

/** Legacy DB rows may still use `emergency` until migration 022 runs. */
export function normalizeGoalType(goalType: string): FinancialGoalType {
  if (goalType === "emergency") return "savings";
  return goalType as FinancialGoalType;
}

export function getGoalTypeLabel(
  goalType: string,
  variant: "short" | "long",
): string {
  const normalized = normalizeGoalType(goalType);
  return variant === "short"
    ? GOAL_TYPE_LABELS_SHORT[normalized]
    : GOAL_TYPE_LABELS_LONG[normalized];
}
