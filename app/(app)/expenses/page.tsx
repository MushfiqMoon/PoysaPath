import Link from "next/link";
import { Suspense } from "react";
import { FiEdit } from "react-icons/fi";

import { EmptyState } from "@/components/empty-state";
import { ExpenseFilters } from "@/components/expense-filters";
import { ExpenseList } from "@/components/expense-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaymentMethod } from "@/lib/constants";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">Expenses</h2>
          <p className="text-sm text-text-muted">
            {monthLabel}
            {filterLabels ? ` · ${filterLabels}` : ""} · Asia/Dhaka
          </p>
        </div>
        <Link href="/add">
          <Button variant="secondary" aria-label="Add expense" className="px-3">
            <FiEdit className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="glass-panel space-y-3 rounded-2xl border p-3 sm:p-4">
            <Skeleton className="h-4 w-16" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-17 sm:col-span-2 lg:col-span-1" />
              <Skeleton className="h-17" />
              <Skeleton className="h-17" />
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
