import Link from "next/link";
import { Suspense } from "react";
import { FiEdit } from "react-icons/fi";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseList } from "@/components/expenses/expense-list";
import { HistoryKindTabs } from "@/components/history/history-kind-tabs";
import { IncomeFilters } from "@/components/income/income-filters";
import { IncomeAmount } from "@/components/income/income-amount";
import { IncomeList } from "@/components/income/income-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaymentMethod } from "@/lib/constants";
import {
  getExpenseCategories,
  getIncomeCategories,
} from "@/lib/data/categories";
import {
  formatMonthLabel,
  getMonthStartInDhaka,
  listMonthStarts,
  monthStartToParam,
  parseMonthStartParam,
} from "@/lib/dates";
import {
  getEarliestExpenseMonthStart,
  getExpenses,
} from "@/lib/data/expenses";
import {
  getEarliestIncomeMonthStart,
  getIncomes,
} from "@/lib/data/incomes";
import { formatCurrency } from "@/lib/format";
import type { CategoryKind } from "@/lib/types";

type HistoryPageProps = {
  searchParams: Promise<{
    tab?: string;
    category?: string;
    payment?: string;
    month?: string;
  }>;
};

function parseHistoryTab(tab: string | undefined): CategoryKind {
  return tab === "income" ? "income" : "expense";
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const {
    tab: tabParam,
    category: categoryId,
    payment: paymentMethod,
    month: monthParam,
  } = await searchParams;

  const activeTab = parseHistoryTab(tabParam);
  const currentMonthStart = getMonthStartInDhaka();
  const monthStart = parseMonthStartParam(monthParam, currentMonthStart);

  const monthLabel = formatMonthLabel(monthStart, currentMonthStart);
  const paymentLabel = paymentMethod
    ? formatPaymentMethod(paymentMethod)
    : null;
  const hasFilters =
    Boolean(categoryId) ||
    Boolean(paymentMethod) ||
    monthStart !== currentMonthStart;

  if (activeTab === "income") {
    const [incomes, categories, earliestMonth] = await Promise.all([
      getIncomes({
        monthStart,
        categoryId: categoryId || undefined,
        paymentMethod: paymentMethod || undefined,
      }),
      getIncomeCategories(),
      getEarliestIncomeMonthStart(),
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
    const filterLabels = [categoryName, paymentLabel]
      .filter(Boolean)
      .join(" · ");

    const emptyDescription =
      filterLabels.length > 0
        ? `No income matching ${filterLabels} in ${monthLabel.toLowerCase()}.`
        : `No income in ${monthLabel.toLowerCase()}.`;

    const periodTotal = incomes.reduce(
      (sum, income) => sum + Number(income.amount),
      0,
    );

    return (
      <div className="space-y-4">
        <HistoryPageHeader
          activeTab="income"
          monthLabel={monthLabel}
          filterLabels={filterLabels}
          periodTotal={periodTotal}
          hasItems={incomes.length > 0}
          hasFilters={hasFilters}
        />

        <Suspense fallback={<FiltersSkeleton />}>
          <HistoryKindTabs activeTab="income" />
        </Suspense>

        <Suspense fallback={<FiltersSkeleton />}>
          <IncomeFilters categories={categories} months={monthOptions} />
        </Suspense>

        {incomes.length === 0 ? (
          <EmptyState
            title="Nothing this period"
            description={emptyDescription}
            actionLabel="Add income"
            actionHref="/add?flow=income"
          />
        ) : (
          <IncomeList incomes={incomes} />
        )}
      </div>
    );
  }

  const [expenses, categories, earliestMonth] = await Promise.all([
    getExpenses({
      monthStart,
      categoryId: categoryId || undefined,
      paymentMethod: paymentMethod || undefined,
    }),
    getExpenseCategories(),
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
  const filterLabels = [categoryName, paymentLabel]
    .filter(Boolean)
    .join(" · ");

  const emptyDescription =
    filterLabels.length > 0
      ? `No expenses matching ${filterLabels} in ${monthLabel.toLowerCase()}.`
      : `No expenses in ${monthLabel.toLowerCase()}.`;

  const periodTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  return (
    <div className="space-y-4">
      <HistoryPageHeader
        activeTab="expense"
        monthLabel={monthLabel}
        filterLabels={filterLabels}
        periodTotal={periodTotal}
        hasItems={expenses.length > 0}
        hasFilters={hasFilters}
      />

      <Suspense fallback={<FiltersSkeleton />}>
        <HistoryKindTabs activeTab="expense" />
      </Suspense>

      <Suspense fallback={<FiltersSkeleton />}>
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

function HistoryPageHeader({
  activeTab,
  monthLabel,
  filterLabels,
  periodTotal,
  hasItems,
  hasFilters,
}: {
  activeTab: CategoryKind;
  monthLabel: string;
  filterLabels: string;
  periodTotal: number;
  hasItems: boolean;
  hasFilters: boolean;
}) {
  const addHref = activeTab === "income" ? "/add?flow=income" : "/add";
  const addLabel = activeTab === "income" ? "Add income" : "Add expense";

  const description = `${monthLabel}${filterLabels ? ` · ${filterLabels}` : ""}`;

  return (
    <PageHeader
      title="History"
      description={description}
      action={
        <div className="flex shrink-0 items-start gap-3">
          {hasItems ? (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {hasFilters ? "Filtered total" : "Total"}
              </p>
              {activeTab === "income" ? (
                <div className="mt-0.5">
                  <IncomeAmount amount={periodTotal} size="lg" />
                </div>
              ) : (
                <p className="mt-0.5 text-xl font-bold tabular-nums text-expense">
                  {formatCurrency(periodTotal)}
                </p>
              )}
            </div>
          ) : null}
          <Link href={addHref}>
            <Button variant="secondary" aria-label={addLabel} className="px-3">
              <FiEdit className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      }
    />
  );
}

function FiltersSkeleton() {
  return (
    <div className="glass-panel rounded-2xl border p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <Skeleton className="h-17 min-w-0 flex-1" />
        <Skeleton className="h-11 w-[5.25rem] shrink-0 rounded-xl" />
      </div>
    </div>
  );
}
