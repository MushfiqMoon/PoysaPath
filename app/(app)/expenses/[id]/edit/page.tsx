import Link from "next/link";
import { notFound } from "next/navigation";

import { ExpenseForm } from "@/components/expense-form";
import { getUserCategories } from "@/lib/data/categories";
import { getExpenseById } from "@/lib/data/expenses";

type EditExpensePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params;
  const [categories, expense] = await Promise.all([
    getUserCategories(),
    getExpenseById(id),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/expenses"
        className="text-sm text-text-muted hover:text-text"
      >
        ← Back to expenses
      </Link>
      <h2 className="text-lg font-semibold text-text">Edit expense</h2>
      <ExpenseForm
        categories={categories}
        expense={expense}
        redirectTo="/expenses"
      />
    </div>
  );
}
