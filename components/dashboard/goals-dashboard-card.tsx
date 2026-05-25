import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { FinancialGoal } from "@/lib/types";

type GoalsDashboardCardProps = {
  goals: FinancialGoal[];
};

export function GoalsDashboardCard({ goals }: GoalsDashboardCardProps) {
  if (goals.length === 0) {
    return (
      <Card padding="md" className="border-dashed">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-muted">Goals</h2>
            <p className="mt-1 text-sm text-text">
              Add a savings, debt, or spend-less goal to make tracking purposeful.
            </p>
          </div>
          <Link href="/settings/goals" className="text-sm font-semibold text-accent">
            Add
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card elevated padding="md" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-muted">Goals</h2>
        <Link href="/settings/goals" className="text-sm font-semibold text-accent">
          Manage
        </Link>
      </div>
      <ul className="space-y-3">
        {goals.map((goal) => (
          <li key={goal.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-text">
                {goal.title}
              </span>
              <span
                className={[
                  "shrink-0 tabular-nums",
                  goal.is_over_target ? "text-danger" : "text-text-muted",
                ].join(" ")}
              >
                {formatCurrency(goal.progress_amount)} /{" "}
                {formatCurrency(goal.target_amount)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg">
              <div
                className={[
                  "h-full rounded-full",
                  goal.is_over_target ? "bg-danger" : "bg-accent",
                ].join(" ")}
                style={{ width: `${Math.min(100, goal.progress_percent)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
