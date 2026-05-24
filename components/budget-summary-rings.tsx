import { ForwardLink } from "@/components/forward-link";
import { BudgetBorderProgressCard } from "@/components/budget-progress-ring";
import { formatCurrency } from "@/lib/format";
import type { BudgetRow } from "@/lib/types";

type BudgetSummaryRingsProps = {
  budgets: BudgetRow[];
};

export function BudgetSummaryRings({ budgets }: BudgetSummaryRingsProps) {
  if (budgets.length === 0) return null;

  const top = budgets.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-muted">Budgets</h2>
        <ForwardLink href="/settings/budget">Manage</ForwardLink>
      </div>
      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {top.map((row) => {
          const pct =
            row.amount > 0
              ? Math.min(100, Math.round((row.spent / row.amount) * 100))
              : 0;
          const over = row.spent > row.amount;
          return (
            <li key={row.id}>
              <BudgetBorderProgressCard spent={row.spent} amount={row.amount}>
                {row.category.icon ? (
                  <span
                    className="text-[1.75rem] leading-none select-none"
                    aria-hidden
                  >
                    {row.category.icon}
                  </span>
                ) : null}
                <span className="max-w-[5.75rem] truncate text-center text-xs font-semibold text-text">
                  {row.category.name}
                </span>
                <span
                  className={[
                    "text-xs font-medium tabular-nums",
                    over ? "text-danger" : "text-text-muted",
                  ].join(" ")}
                >
                  {pct}%
                </span>
                <span className="sr-only">
                  {formatCurrency(row.spent)} of {formatCurrency(row.amount)}
                </span>
              </BudgetBorderProgressCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
