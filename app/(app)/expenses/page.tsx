import Link from "next/link";
import { Suspense } from "react";
import { FiEdit } from "react-icons/fi";

import { EmptyState } from "@/components/shared/empty-state";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseList } from "@/components/expenses/expense-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaymentMethod } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getUserCategories } from "@/lib/data/categories";
import {
  formatMonthLabel,
  getMonthStartInDhaka,
  listMonthStarts,
  monthStartToParam,
  parseMonthStartParam,
} from "@/lib/dates";
import { getEarliestExpenseMonthStart, getExpenses } from "@/lib/data/expenses";

type ExpensesPageProps = {
  searchParams: Promise<{ category?: string; payment?: string; month?: string }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { category: categoryId, payment: paymentMethod, month: monthParam } =
    await searchParams;

  const currentMonthStart = getMonthStartInDhaka();
  const monthStart = parseMonthStartParam(monthParam, currentMonthStart);

  const [expenses, categories, earliestMonth] = await Promise.all([
    getExpenses({
      monthStart,
      categoryId: categoryId || undefined,
      paymentMethod: paymentMethod || undefined,
    }),
    getUserCategories(),
    getEarliestExpenseMonthStart(),
  ]);

  const fromMonth = earliestMonth ?? currentMonthStart;
  const monthOptions = listMonthStarts(fromMonth, currentMonthStart).map(
    (start) => ({
      value: monthStartToParam(start),
      label: formatMonthLabel(start, currentMonthStart),
    }),
  );

  const categoryName = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : null;
  const paymentLabel = paymentMethod
    ? formatPaymentMethod(paymentMethod)
    : null;
  const filterLabels = [categoryName, paymentLabel].filter(Boolean).join(" · ");
  const monthLabel = formatMonthLabel(monthStart, currentMonthStart);

  const emptyDescription =
    filterLabels.length > 0
      ? `No expenses matching ${filterLabels} in ${monthLabel.toLowerCase()}.`
      : `No expenses in ${monthLabel.toLowerCase()}.`;

  const periodTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const hasFilters =
    Boolean(categoryId) ||
    Boolean(paymentMethod) ||
    monthStart !== currentMonthStart;

  return (
    <div className="space-y-4">
      <section className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className="text-2xl font-bold tracking-tight text-text"
            style={{ letterSpacing: "-0.02em" }}
          >
            Expenses
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {monthLabel}
            {filterLabels ? ` · ${filterLabels}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-3">
          {expenses.length > 0 ? (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {hasFilters ? "Filtered total" : "Total"}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-text">
                {formatCurrency(periodTotal)}
              </p>
            </div>
          ) : null}
          <Link href="/add">
            <Button variant="secondary" aria-label="Add expense" className="px-3">
              <FiEdit className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="glass-panel rounded-2xl border p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Skeleton className="h-17 min-w-0 flex-1" />
              <Skeleton className="h-11 w-[5.25rem] shrink-0 rounded-xl" />
            </div>
          </div>
        }
      >
        <ExpenseFilters categories={categories} months={monthOptions} />
      </Suspense>

      {expenses.length === 0 ? (
        <EmptyState
          title="Nothing this period"
          description={emptyDescription}
          actionLabel="Add expense"
          actionHref="/add"
        />
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  );
}
