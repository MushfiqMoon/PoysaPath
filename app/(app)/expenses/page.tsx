import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { ExpenseFilters } from "@/components/expense-filters";
import { ExpenseList } from "@/components/expense-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserCategories } from "@/lib/data/categories";
import { getMonthStartInDhaka } from "@/lib/dates";
import { getExpenses } from "@/lib/data/expenses";

type ExpensesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { category: categoryId } = await searchParams;
  const monthStart = getMonthStartInDhaka();
  const [expenses, categories] = await Promise.all([
    getExpenses({ monthStart, categoryId: categoryId || undefined }),
    getUserCategories(),
  ]);

  const categoryName = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">Expenses</h2>
          <p className="text-sm text-text-muted">
            This month
            {categoryName ? ` · ${categoryName}` : ""} · Asia/Dhaka
          </p>
        </div>
        <Link href="/add">
          <Button variant="secondary">Add</Button>
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-11 w-full" />}>
        <ExpenseFilters categories={categories} />
      </Suspense>

      {expenses.length === 0 ? (
        <EmptyState
          title="Nothing this period"
          description={
            categoryName
              ? `No expenses in ${categoryName} this month.`
              : "Add your first expense to see it here."
          }
          actionLabel="Add expense"
          actionHref="/add"
        />
      ) : (
        <ExpenseList expenses={expenses} />
      )}
    </div>
  );
}
