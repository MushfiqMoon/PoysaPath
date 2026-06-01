import { Card } from "@/components/ui/card";
import { CompactActionLink } from "@/components/ui/compact-action";
import { formatCurrency } from "@/lib/format";
import type { FinancialGoal, FinancialGoalType } from "@/lib/types";

type GoalsDashboardCardProps = {
  goals: FinancialGoal[];
};

const goalTypeLabels: Record<FinancialGoalType, string> = {
  savings: "Savings",
  emergency: "Emergency",
  debt_payoff: "Debt payoff",
  category_challenge: "Spend-less",
};

function GoalProgressItem({ goal }: { goal: FinancialGoal }) {
  const progress = Math.min(100, goal.progress_percent);
  const isChallenge = goal.goal_type === "category_challenge";
  const isAtChallengeLimit =
    isChallenge && !goal.is_over_target && goal.progress_percent >= 100;
  const resultLabel = goal.is_over_target
    ? `${formatCurrency(goal.progress_amount - goal.target_amount)} over target`
    : isChallenge
      ? isAtChallengeLimit
        ? "At the limit"
        : `${formatCurrency(goal.remaining_amount)} left this month`
      : `${formatCurrency(goal.remaining_amount)} left`;
  const percentLabel = isChallenge ? `${progress}% used` : `${progress}%`;

  return (
    <li className="rounded-2xl border border-border/70 bg-bg/45 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 truncate font-semibold text-text">
              {goal.title}
            </span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[0.7rem] font-medium text-text-muted">
              {goalTypeLabels[goal.goal_type]}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {goal.category?.icon ? `${goal.category.icon} ` : ""}
            {goal.category?.name ?? (isChallenge ? "Monthly challenge" : "Manual progress")}
          </p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2 py-1 text-xs font-semibold tabular-nums",
            goal.is_over_target
              ? "bg-danger/10 text-danger"
              : isAtChallengeLimit
                ? "bg-bg text-text-muted"
              : "bg-accent/10 text-accent",
          ].join(" ")}
        >
          {percentLabel}
        </span>
      </div>

      <div className="mt-3">
        <div className="mb-2 flex items-end justify-between gap-3 text-xs">
          <span className="text-text-muted">
            {isChallenge ? "Limit used" : "Progress"}
          </span>
          <span
            className={[
              "text-right font-semibold tabular-nums",
              goal.is_over_target ? "text-danger" : "text-text",
            ].join(" ")}
          >
            {formatCurrency(goal.progress_amount)} /{" "}
            {formatCurrency(goal.target_amount)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div
            className={[
              "h-full rounded-full transition-[width] duration-300",
              goal.is_over_target ? "bg-danger" : "bg-accent",
            ].join(" ")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className={[
            "mt-2 text-xs",
            goal.is_over_target ? "text-danger" : "text-text-muted",
          ].join(" ")}
        >
          {resultLabel}
        </p>
      </div>
    </li>
  );
}

export function GoalsDashboardCard({ goals }: GoalsDashboardCardProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Card elevated padding="none" className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
        <div>
          <h2 className="text-sm font-semibold text-text-muted">Pinned goals</h2>
          <p className="mt-1 text-sm text-text">
            The goals you chose to keep visible.
          </p>
        </div>
        <CompactActionLink href="/settings/goals" variant="soft">
          Manage
        </CompactActionLink>
      </div>

      <ul className="space-y-2 p-3">
        {goals.map((goal) => (
          <GoalProgressItem key={goal.id} goal={goal} />
        ))}
      </ul>
    </Card>
  );
}
