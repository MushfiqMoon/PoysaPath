import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/lib/types";

type CategoryBreakdownProps = {
  totals: CategoryTotal[];
  monthTotal: number;
};

export function CategoryBreakdown({
  totals,
  monthTotal,
}: CategoryBreakdownProps) {
  if (totals.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-text-muted">
        Spending by category
      </h2>
      <ul className="space-y-2">
        {totals.map((row) => {
          const pct =
            monthTotal > 0
              ? Math.round((row.total / monthTotal) * 100)
              : 0;
          return (
            <li key={row.category_id}>
              <Link
                href={`/expenses?category=${row.category_id}`}
                className="block rounded-lg transition-colors hover:bg-surface/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-text">
                    {row.icon && <span aria-hidden>{row.icon} </span>}
                    {row.name}
                  </span>
                  <span className="font-medium tabular-nums text-text">
                    {formatCurrency(row.total)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                </div>
                <span className="sr-only">
                  View expenses in {row.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
