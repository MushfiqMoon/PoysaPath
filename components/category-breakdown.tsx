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
      <h2 className="text-sm font-semibold text-text-muted">
        Spending by category
      </h2>
      <ul className="space-y-3">
        {totals.map((row) => {
          const pct =
            monthTotal > 0
              ? Math.round((row.total / monthTotal) * 100)
              : 0;
          return (
            <li key={row.category_id}>
              <Link
                href={`/expenses?category=${row.category_id}`}
                className="block rounded-lg py-0.5 transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="mb-1.5 flex justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate font-medium text-text">
                    {row.icon && <span aria-hidden>{row.icon} </span>}
                    {row.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-text">
                    {formatCurrency(row.total)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-[var(--dur-medium)]"
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
