import { ExpenseListRow } from "@/components/expenses/expense-list-row";
import { Card } from "@/components/ui/card";
import {
  formatCurrency,
  formatExpenseTitle,
  formatRelativeDay,
} from "@/lib/format";
import type { Expense } from "@/lib/types";

function sumAmounts(items: Expense[]) {
  return items.reduce((sum, expense) => sum + Number(expense.amount), 0);
}

type ExpenseListProps = {
  expenses: Expense[];
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card padding="lg" className="border-dashed bg-surface/60 text-center text-text-muted">
        Nothing this period yet.
      </Card>
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
      {[...groups.entries()].map(([date, items]) => {
        const dayTotal = sumAmounts(items);
        return (
          <section key={date}>
            <div className="sticky top-0 z-[1] -mx-2 mb-2 flex items-center justify-between gap-3 px-2 py-2 backdrop-blur-md">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {formatRelativeDay(date)}
              </h3>
              <p className="shrink-0 text-base font-bold tabular-nums text-expense sm:text-lg">
                {formatCurrency(dayTotal)}
              </p>
            </div>
            <ul className="space-y-2">
              {items.map((expense) => {
                const categoryName = expense.categories?.name ?? "Expense";
                const title = formatExpenseTitle(expense.note, categoryName);
                return (
                  <ExpenseListRow
                    key={expense.id}
                    expense={expense}
                    categoryName={categoryName}
                    title={title}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
