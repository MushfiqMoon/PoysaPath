import { GoalProgressTrack } from "@/components/goals/goal-progress-bar";
import { StackPeekStrip } from "@/components/shared/stack-peek-strip";
import { Card } from "@/components/ui/card";
import { GOAL_TYPE_LABELS_SHORT } from "@/lib/goals/labels";
import {
  getGoalProgressBadgeClass,
  getGoalProgressPercentLabel,
} from "@/lib/goals/progress";
import type { FinancialGoal } from "@/lib/types";

type GoalStackPreviewCardProps = {
  goal: FinancialGoal;
  variant: "peek" | "front";
  showHint?: boolean;
  tapHint?: string;
};

export function GoalStackPreviewCard({
  goal,
  variant,
  showHint = false,
  tapHint = "Tap to open · Swipe to browse",
}: GoalStackPreviewCardProps) {
  const isActive = goal.status === "active";

  if (variant === "peek") {
    return (
      <StackPeekStrip
        title={goal.title}
        meta={GOAL_TYPE_LABELS_SHORT[goal.goal_type]}
        accent={isActive}
      />
    );
  }

  return (
    <Card
      padding="none"
      className={[
        "pointer-events-none w-full overflow-hidden shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
        isActive
          ? "border-accent/40 shadow-[0_8px_28px_rgba(15,185,177,0.12)]"
          : "border-border",
      ].join(" ")}
    >
      {isActive ? <div className="h-1 bg-accent" aria-hidden /> : null}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 truncate text-base font-semibold tracking-tight text-text">
                {goal.title}
              </p>
              {isActive ? (
                <span className="features-hero__live-dot shrink-0" aria-hidden />
              ) : null}
            </div>
            <p className="mt-1 text-xs text-text-muted">
              <span className="rounded-full bg-bg/70 px-2 py-0.5">
                {GOAL_TYPE_LABELS_SHORT[goal.goal_type]}
              </span>
              {goal.category ? (
                <span className="ml-2">
                  {goal.category.icon ? `${goal.category.icon} ` : ""}
                  {goal.category.name}
                </span>
              ) : null}
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

        <GoalProgressTrack goal={goal} className="h-2" />

        {showHint ? (
          <p className="text-center text-xs text-text-muted">{tapHint}</p>
        ) : null}
      </div>
    </Card>
  );
}
