import Link from "next/link";

import { BudgetProgressRing } from "@/components/budget-progress-ring";
import { formatCurrency } from "@/lib/format";
import type { BudgetRow } from "@/lib/types";

type BudgetSummaryRingsProps = {
  budgets: BudgetRow[];
};

export function BudgetSummaryRings({ budgets }: BudgetSummaryRingsProps) {
  if (budgets.length === 0) return null;

  const top = budgets.slice(0, 4);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-muted">Budgets</h2>
        <Link href="/settings/budget" className="text-sm text-accent">
          Manage →
        </Link>
      </div>
      <ul className="flex gap-4 overflow-x-auto pb-1">
        {top.map((row) => {
          const pct =
            row.amount > 0
              ? Math.min(100, Math.round((row.spent / row.amount) * 100))
              : 0;
          const over = row.spent > row.amount;
          return (
            <li
              key={row.id}
              className="flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-3"
            >
              <BudgetProgressRing
                spent={row.spent}
                amount={row.amount}
                icon={row.category.icon}
              />
              <span className="max-w-[5.5rem] truncate text-center text-xs font-medium text-text">
                {row.category.name}
              </span>
              <span
                className={[
                  "text-xs tabular-nums",
                  over ? "text-danger" : "text-text-muted",
                ].join(" ")}
              >
                {pct}%
              </span>
              <span className="sr-only">
                {formatCurrency(row.spent)} of {formatCurrency(row.amount)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
