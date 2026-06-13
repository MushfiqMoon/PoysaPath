"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

import { createFinancialGoal } from "@/app/(app)/actions/goals";
import { GoalDetailPanel } from "@/components/goals/goal-detail-panel";
import { GoalStackPreviewCard } from "@/components/goals/goal-stack-preview-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ResponsiveItemList } from "@/components/shared/responsive-item-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GOAL_TYPE_LABELS_LONG } from "@/lib/goals/labels";
import type { Category, FinancialGoal, FinancialGoalType } from "@/lib/types";

type GoalsManagerProps = {
  goals: FinancialGoal[];
  categories: Pick<Category, "id" | "name" | "icon">[];
  currentMonth: string;
};

export function GoalsManager({ goals, categories, currentMonth }: GoalsManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<FinancialGoalType>("savings");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetMonth, setTargetMonth] = useState(currentMonth.slice(0, 7));
  const [dueDate, setDueDate] = useState("");
  const [showOnDashboard, setShowOnDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(goals.length === 0);

  useEffect(() => {
    if (goals.length === 0) setIsFormOpen(true);
  }, [goals.length]);

  const isChallenge = goalType === "category_challenge";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createFinancialGoal({
        title,
        goal_type: goalType,
        category_id: isChallenge ? categoryId : null,
        target_amount: Number(targetAmount),
        current_amount: isChallenge ? 0 : Number(currentAmount || 0),
        target_month: isChallenge ? `${targetMonth}-01` : null,
        due_date: isChallenge || !dueDate ? null : dueDate,
        show_on_dashboard: showOnDashboard,
      });
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setDueDate("");
      setShowOnDashboard(false);
      setIsFormOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          aria-expanded={isFormOpen}
          aria-controls="goal-create-form"
          disabled={loading}
          onClick={() => {
            setError(null);
            setIsFormOpen((open) => !open);
          }}
          className="group flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-[background-color] duration-(--dur-short) hover:bg-accent/6 active:bg-accent/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="min-w-0">
            <span className="block font-semibold text-text">Add financial goal</span>
            <span className="mt-0.5 block text-sm text-text-muted">
              Set targets for saving, debt payoff, or monthly spending limits.
            </span>
          </span>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-lg font-semibold text-accent transition-colors group-hover:bg-accent/18"
            aria-hidden
          >
            {isFormOpen ? (
              <FiMinimize2 className="h-4 w-4" />
            ) : (
              <FiMaximize2 className="h-4 w-4" />
            )}
          </span>
        </button>

        {isFormOpen ? (
          <form
            id="goal-create-form"
            onSubmit={handleCreate}
            className="space-y-4 border-t border-border/60 p-4"
          >
            <div>
              <Label htmlFor="goal-title">Goal name</Label>
              <Input
                id="goal-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Emergency fund"
              />
            </div>

            <div>
              <Label htmlFor="goal-type">Goal type</Label>
              <select
                id="goal-type"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as FinancialGoalType)}
                className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
              >
                {Object.entries(GOAL_TYPE_LABELS_LONG).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {isChallenge ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="goal-category">Category</Label>
                  <select
                    id="goal-category"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="goal-month">Challenge month</Label>
                  <Input
                    id="goal-month"
                    type="month"
                    required
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal-target">Target amount (৳)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              {isChallenge ? null : (
                <div>
                  <Label htmlFor="goal-current">Current progress (৳)</Label>
                  <Input
                    id="goal-current"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              )}
            </div>

            {!isChallenge ? (
              <div>
                <Label htmlFor="goal-due">Target date (optional)</Label>
                <Input
                  id="goal-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            ) : null}

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-bg/45 p-3 text-sm transition-[border-color,background-color] duration-(--dur-short) hover:border-accent/40 hover:bg-accent/6">
              <input
                type="checkbox"
                checked={showOnDashboard}
                onChange={(e) => setShowOnDashboard(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <span>
                <span className="block font-medium text-text">
                  Show on Dashboard
                </span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  Use this for goals you want to track from Home.
                </span>
              </span>
            </label>

            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth loading={loading}>
              Add goal
            </Button>
          </form>
        ) : null}
      </Card>

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Add a target to turn daily tracking into a reason to come back."
        />
      ) : (
        <section className="space-y-4">
          <h2 className="hidden text-sm font-semibold text-text-muted md:block">
            Your goals
          </h2>
          <ResponsiveItemList
          items={goals}
          getItemId={(goal) => goal.id}
          label="goals"
          onItemSelect={(goal) => router.push(`/settings/goals/${goal.id}`)}
          renderPeek={(goal) => (
            <GoalStackPreviewCard goal={goal} variant="peek" />
          )}
          renderFront={(goal, { showHint, tapHint }) => (
            <GoalStackPreviewCard
              goal={goal}
              variant="front"
              showHint={showHint}
              tapHint={tapHint}
            />
          )}
          renderDesktop={(goal) => <GoalDetailPanel goal={goal} />}
          desktopListClassName="space-y-4"
        />
        </section>
      )}
    </div>
  );
}
