import { IncomeAmount } from "@/components/income/income-amount";
import { IncomeListRow } from "@/components/income/income-list-row";
import { Card } from "@/components/ui/card";
import {
  formatExpenseTitle,
  formatRelativeDay,
} from "@/lib/format";
import type { Income } from "@/lib/types";

function sumAmounts(items: Income[]) {
  return items.reduce((sum, income) => sum + Number(income.amount), 0);
}

type IncomeListProps = {
  incomes: Income[];
};

export function IncomeList({ incomes }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <Card padding="lg" className="border-dashed bg-surface/60 text-center text-text-muted">
        Nothing this period yet.
      </Card>
    );
  }

  const groups = new Map<string, Income[]>();
  for (const income of incomes) {
    const key = income.income_date;
    const list = groups.get(key) ?? [];
    list.push(income);
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
              <IncomeAmount amount={dayTotal} size="md" />
            </div>
            <ul className="space-y-2">
              {items.map((income) => {
                const categoryName = income.categories?.name ?? "Income";
                const title = formatExpenseTitle(income.note, categoryName);
                return (
                  <IncomeListRow
                    key={income.id}
                    income={income}
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
