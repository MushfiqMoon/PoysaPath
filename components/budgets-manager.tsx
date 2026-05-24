"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteBudget, upsertBudget } from "@/app/(app)/actions/budgets";
import { BudgetProgressRing } from "@/components/budget-progress-ring";
import { formatCurrency } from "@/lib/format";
import type { BudgetRow, Category } from "@/lib/types";
import { DeleteButton } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";

type BudgetsManagerProps = {
  budgets: BudgetRow[];
  unbudgetedCategories: Pick<Category, "id" | "name" | "icon">[];
  monthLabel: string;
};

export function BudgetsManager({
  budgets,
  unbudgetedCategories,
  monthLabel,
}: BudgetsManagerProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(
    unbudgetedCategories[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSetBudget(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await upsertBudget(categoryId, Number(amount));
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save budget");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {budgets.length === 0 ? (
        <EmptyState
          title="No budgets set"
          description={`Set a monthly limit per category for ${monthLabel}.`}
        />
      ) : (
        <ul className="space-y-3">
          {budgets.map((row) => {
            const pct =
              row.amount > 0
                ? Math.min(100, Math.round((row.spent / row.amount) * 100))
                : 0;
            const over = row.spent > row.amount;
            return (
              <li key={row.id}>
                <Card padding="md" className="flex gap-4">
                <BudgetProgressRing
                  spent={row.spent}
                  amount={row.amount}
                  size={52}
                  icon={row.category.icon}
                />
                <div className="min-w-0 flex-1">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-text">
                    {row.category.name}
                  </span>
                  <span
                    className={[
                      "tabular-nums",
                      over ? "text-danger" : "text-text-muted",
                    ].join(" ")}
                  >
                    {formatCurrency(row.spent)} / {formatCurrency(row.amount)}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{pct}% used</p>
                <DeleteButton
                  type="button"
                  className="mt-2 min-h-8 justify-start px-0"
                  onClick={async () => {
                    await deleteBudget(row.id);
                    router.refresh();
                  }}
                >
                  Remove budget
                </DeleteButton>
                </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {unbudgetedCategories.length > 0 && (
        <Card padding="md">
          <form onSubmit={handleSetBudget} className="space-y-3">
            <p className="font-semibold tracking-tight text-text">Set budget</p>
          <div>
            <Label htmlFor="budget-category">Category</Label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2"
              required
            >
              {unbudgetedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="budget-amount">Monthly limit (৳)</Label>
            <Input
              id="budget-amount"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth disabled={loading || !categoryId}>
            {loading ? "Saving…" : "Set budget"}
          </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
