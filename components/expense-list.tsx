import Link from "next/link";

import { formatCurrency, formatExpenseTitle, formatRelativeDay } from "@/lib/format";
import type { Expense } from "@/lib/types";

type ExpenseListProps = {
  expenses: Expense[];
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-text-muted">
        Nothing this period yet.
      </p>
    );
  }

  const groups = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const key = expense.expense_date;
    const list = groups.get(key) ?? [];
    list.push(expense);
    groups.set(key, list);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([date, items]) => (
        <section key={date}>
          <h3 className="mb-2 text-sm font-medium text-text-muted">
            {formatRelativeDay(date)}
          </h3>
          <ul className="space-y-2">
            {items.map((expense) => {
              const categoryName = expense.categories?.name ?? "Expense";
              const title = formatExpenseTitle(expense.note, categoryName);
              const meta = [
                categoryName,
                expense.payment_method,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={expense.id}>
                  <Link
                    href={`/expenses/${expense.id}/edit`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium text-text">
                        {expense.categories?.icon && (
                          <span className="mr-1" aria-hidden>
                            {expense.categories.icon}
                          </span>
                        )}
                        {title}
                      </p>
                      {meta && (
                        <p className="mt-0.5 truncate text-sm text-text-muted">
                          {meta}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-text">
                      {formatCurrency(Number(expense.amount))}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
