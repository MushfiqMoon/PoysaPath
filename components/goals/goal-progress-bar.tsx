import { formatCurrency } from "@/lib/format";
import {
  getGoalProgressAmountClass,
  getGoalProgressPercent,
  getGoalProgressPercentLabel,
  getGoalProgressStatusLabel,
  isGoalChallenge,
  type GoalProgressLabelStyle,
} from "@/lib/goals/progress";
import type { FinancialGoal } from "@/lib/types";

type GoalProgressBarProps = {
  goal: FinancialGoal;
  style?: GoalProgressLabelStyle;
};

export function GoalProgressBar({
  goal,
  style = "dashboard",
}: GoalProgressBarProps) {
  const isChallenge = isGoalChallenge(goal);
  const progressClass = getGoalProgressAmountClass(goal);
  const progressLabel =
    style === "dashboard"
      ? isChallenge
        ? "Limit used"
        : "Progress"
      : isChallenge
        ? "spent"
        : "saved / paid";
  const trackClass = style === "settings" ? "h-2.5" : "h-2";

  if (style === "dashboard") {
    return (
      <div className="mt-3">
        <div className="mb-2 flex items-end justify-between gap-3 text-xs">
          <span className="text-text-muted">{progressLabel}</span>
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
        <GoalProgressTrack goal={goal} className={trackClass} />
        <p
          className={[
            "mt-2 text-xs",
            goal.is_over_target ? "text-danger" : "text-text-muted",
          ].join(" ")}
        >
          {getGoalProgressStatusLabel(goal, style)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg/45 p-3">
      <div className="mb-2 flex items-end justify-between gap-3 text-xs text-text-muted">
        <span className="capitalize">{progressLabel}</span>
        <span className={`text-right font-semibold tabular-nums ${progressClass}`}>
          {formatCurrency(goal.progress_amount)} /{" "}
          {formatCurrency(goal.target_amount)}
        </span>
      </div>
      <GoalProgressTrack goal={goal} className={trackClass} />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-text-muted">
          {getGoalProgressPercentLabel(goal, style)}
        </span>
        <span
          className={goal.is_over_target ? "text-danger" : "text-text-muted"}
        >
          {getGoalProgressStatusLabel(goal, style)}
        </span>
      </div>
    </div>
  );
}

function GoalProgressTrack({
  goal,
  className,
}: {
  goal: FinancialGoal;
  className: string;
}) {
  const progress = getGoalProgressPercent(goal);

  return (
    <div className={`${className} overflow-hidden rounded-full bg-surface`}>
      <div
        className={[
          "h-full rounded-full transition-[width] duration-300",
          goal.is_over_target ? "bg-danger" : "bg-accent",
        ].join(" ")}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
