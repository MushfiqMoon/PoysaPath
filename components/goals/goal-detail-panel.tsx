"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import {
  addFinancialGoalContribution,
  completeFinancialGoal,
  deleteFinancialGoalContribution,
  deleteFinancialGoal,
  updateFinancialGoalDashboardVisibility,
} from "@/app/(app)/actions/goals";
import { GoalProgressBar } from "@/components/goals/goal-progress-bar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DeleteButton } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { GOAL_TYPE_LABELS_LONG } from "@/lib/goals/labels";
import {
  getGoalProgressPercent,
  isGoalChallenge,
} from "@/lib/goals/progress";
import type { FinancialGoal } from "@/lib/types";

type GoalDetailPanelProps = {
  goal: FinancialGoal;
  showTitle?: boolean;
};

export function GoalDetailPanel({ goal, showTitle = true }: GoalDetailPanelProps) {
  const router = useRouter();
  const { loading, error, setError, runAction } = useServerAction(
    "Could not update goal",
  );
  const [contributionAmount, setContributionAmount] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contributionLoading, setContributionLoading] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(
    null,
  );
  const isChallenge = isGoalChallenge(goal);
  const isActive = goal.status === "active";
  const isChallengeAchieved =
    isChallenge && !goal.is_over_target && goal.progress_percent < 100;
  const completeConfirmMessage = isChallenge
    ? goal.is_over_target
      ? `${goal.title} is over its spend-less target. Mark it complete anyway?`
      : `${goal.title} has used ${getGoalProgressPercent(goal)}% of its spend limit. Mark it complete anyway?`
    : `${goal.title} is only ${getGoalProgressPercent(goal)}% complete. Mark it complete anyway?`;
  const statusClass = goal.status === "completed"
    ? "bg-accent/12 text-accent ring-accent/25"
    : isActive
      ? "bg-accent/10 text-accent ring-accent/25"
      : "bg-bg/70 text-text-muted ring-border/60";

  async function handleContributionAdd(e: React.FormEvent) {
    e.preventDefault();
    setContributionLoading(true);
    setContributionError(null);
    try {
      await addFinancialGoalContribution(goal.id, Number(contributionAmount));
      setContributionAmount("");
      router.refresh();
    } catch (err) {
      setContributionError(
        err instanceof Error ? err.message : "Could not update progress",
      );
    } finally {
      setContributionLoading(false);
    }
  }

  function requestComplete() {
    if ((!isChallenge && goal.progress_percent >= 100) || isChallengeAchieved) {
      void runAction(() => completeFinancialGoal(goal.id));
      return;
    }

    setError(null);
    setConfirmComplete(true);
  }

  async function handleConfirmComplete() {
    if (await runAction(() => completeFinancialGoal(goal.id))) {
      setConfirmComplete(false);
    }
  }

  async function handleConfirmDelete() {
    if (await runAction(() => deleteFinancialGoal(goal.id))) {
      setConfirmDelete(false);
      router.push("/settings/goals");
    }
  }

  function handleDashboardVisibilityChange(checked: boolean) {
    void runAction(() =>
      updateFinancialGoalDashboardVisibility(goal.id, checked),
    );
  }

  const displayError = contributionError ?? error;

  return (
    <>
      <Card
        padding="none"
        className={[
          "overflow-hidden",
          isActive ? "border-accent/40 shadow-[0_0_24px_rgba(15,185,177,0.08)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isActive ? <div className="h-1 bg-accent" aria-hidden /> : null}
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {showTitle ? (
                <p className="truncate text-base font-semibold tracking-tight text-text">
                  {goal.title}
                </p>
              ) : null}
              <div
                className={[
                  "flex flex-wrap items-center gap-2 text-xs text-text-muted",
                  showTitle ? "mt-1" : "",
                ].join(" ")}
              >
                <span>{GOAL_TYPE_LABELS_LONG[goal.goal_type]}</span>
                {goal.category ? (
                  <span className="rounded-full bg-bg/70 px-2 py-0.5">
                    {goal.category.icon ? `${goal.category.icon} ` : ""}
                    {goal.category.name}
                  </span>
                ) : null}
              </div>
            </div>
            <span
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                statusClass,
              ].join(" ")}
            >
              {isActive ? (
                <span className="features-hero__live-dot shrink-0" aria-hidden />
              ) : null}
              {goal.status}
            </span>
          </div>

          <GoalProgressBar goal={goal} style="settings" />

          {!isChallenge && goal.status !== "completed" ? (
            <form
              onSubmit={handleContributionAdd}
              className="rounded-2xl border border-border/70 bg-surface/60 p-3"
            >
              <Label htmlFor={`goal-contribution-${goal.id}`}>Add amount (৳)</Label>
              <div className="flex gap-2">
                <Input
                  id={`goal-contribution-${goal.id}`}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  aria-label={`Add amount for ${goal.title}`}
                />
                <Button type="submit" size="sm" loading={contributionLoading}>
                  Add
                </Button>
              </div>
            </form>
          ) : null}

          {!isChallenge && goal.contributions.length > 0 ? (
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-bg/35">
              <button
                type="button"
                aria-expanded={isHistoryOpen}
                aria-controls={`goal-contributions-${goal.id}`}
                onClick={() => setIsHistoryOpen((open) => !open)}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text">
                    Contribution history
                  </span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    Review or remove previous amounts
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-surface px-2 py-1 text-xs text-text-muted">
                    {goal.contributions.length}
                  </span>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/12 text-accent transition-colors group-hover:bg-accent/18"
                    aria-hidden
                  >
                    {isHistoryOpen ? (
                      <FiMinimize2 className="h-4 w-4" />
                    ) : (
                      <FiMaximize2 className="h-4 w-4" />
                    )}
                  </span>
                </span>
              </button>

              {isHistoryOpen ? (
                <ul
                  id={`goal-contributions-${goal.id}`}
                  className="divide-y divide-border/60 border-t border-border/60 px-3"
                >
                  {goal.contributions.map((contribution) => (
                    <li
                      key={contribution.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tabular-nums text-text">
                          {formatCurrency(contribution.amount)}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatRelativeDay(contribution.created_at.slice(0, 10))}
                        </p>
                      </div>
                      <DeleteButton
                        type="button"
                        className="min-h-8 px-1 text-xs"
                        disabled={loading}
                        onClick={() =>
                          void runAction(() =>
                            deleteFinancialGoalContribution(contribution.id),
                          )
                        }
                      >
                        Delete
                      </DeleteButton>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {displayError ? (
            <p className="text-sm text-danger" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <label
              className={[
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-bg/45 px-3 py-2 text-sm transition-[border-color,background-color,opacity] duration-(--dur-short) hover:border-accent/40 hover:bg-accent/6",
                !isActive ? "cursor-not-allowed opacity-65" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={goal.show_on_dashboard}
                disabled={loading || !isActive}
                onChange={(e) => handleDashboardVisibilityChange(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span className="min-w-0">
                <span className="block font-medium text-text">
                  Show on Dashboard
                </span>
                <span className="block text-xs text-text-muted">
                  {isActive
                    ? "Pin this goal to the home card."
                    : "Only active goals can appear on the dashboard."}
                </span>
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {goal.status !== "completed" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={requestComplete}
                >
                  Mark complete
                </Button>
              ) : null}
              <DeleteButton
                type="button"
                disabled={loading}
                onClick={() => {
                  setError(null);
                  setConfirmDelete(true);
                }}
              >
                Delete
              </DeleteButton>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmComplete}
        title="Mark goal complete?"
        message={completeConfirmMessage}
        confirmLabel="Mark complete"
        loading={loading}
        onCancel={() => setConfirmComplete(false)}
        onConfirm={() => void handleConfirmComplete()}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete goal?"
        message={`Delete "${goal.title}" and its contribution history? This cannot be undone.`}
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  );
}
