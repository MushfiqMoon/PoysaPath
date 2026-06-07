import { GoalProgressBar } from "@/components/goals/goal-progress-bar";
import { Card } from "@/components/ui/card";
import { CompactActionLink } from "@/components/ui/compact-action";
import { GOAL_TYPE_LABELS_SHORT } from "@/lib/goals/labels";
import {
  getGoalProgressBadgeClass,
  getGoalProgressPercentLabel,
  isGoalChallenge,
} from "@/lib/goals/progress";
import type { FinancialGoal } from "@/lib/types";

type GoalsDashboardCardProps = {
  goals: FinancialGoal[];
};

function GoalProgressItem({ goal }: { goal: FinancialGoal }) {
  const isChallenge = isGoalChallenge(goal);

  return (
    <li className="rounded-2xl border border-border/70 bg-bg/45 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 truncate font-semibold text-text">
              {goal.title}
            </span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[0.7rem] font-medium text-text-muted">
              {GOAL_TYPE_LABELS_SHORT[goal.goal_type]}
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
            getGoalProgressBadgeClass(goal),
          ].join(" ")}
        >
          {getGoalProgressPercentLabel(goal, "dashboard")}
        </span>
      </div>

      <GoalProgressBar goal={goal} style="dashboard" />
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
