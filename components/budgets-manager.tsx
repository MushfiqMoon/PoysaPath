"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteBudget, upsertBudget } from "@/app/(app)/actions/budgets";
import { formatCurrency } from "@/lib/format";
import type { BudgetRow, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
              <li
                key={row.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-text">
                    {row.category.icon && (
                      <span className="mr-1" aria-hidden>
                        {row.category.icon}
                      </span>
                    )}
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
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      over ? "bg-danger" : "bg-accent",
                    ].join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-text-muted">{pct}% used</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 min-h-8 px-0 text-xs text-danger"
                  onClick={async () => {
                    await deleteBudget(row.id);
                    router.refresh();
                  }}
                >
                  Remove budget
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {unbudgetedCategories.length > 0 && (
        <form
          onSubmit={handleSetBudget}
          className="space-y-3 rounded-xl border border-border bg-surface p-4"
        >
          <p className="font-medium text-text">Set budget</p>
          <div>
            <Label htmlFor="budget-category">Category</Label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2"
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
      )}
    </div>
  );
}
