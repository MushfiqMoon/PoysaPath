import { ExpenseListRow } from "@/components/expense-list-row";
import { formatExpenseTitle, formatRelativeDay } from "@/lib/format";
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
          <h3 className="sticky top-0 z-[1] mb-2 bg-bg/95 py-1 text-sm font-medium text-text-muted backdrop-blur-sm">
            {formatRelativeDay(date)}
          </h3>
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
      ))}
    </div>
  );
}
