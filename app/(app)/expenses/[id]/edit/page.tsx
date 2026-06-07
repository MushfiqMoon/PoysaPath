import { BackLink } from "@/components/shared/back-link";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getUserCategories } from "@/lib/data/categories";
import { getExpenseById } from "@/lib/data/expenses";
import { notFound } from "next/navigation";

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
      <BackLink href="/history">Back to history</BackLink>
      <h2 className="text-lg font-semibold text-text">Edit expense</h2>
      <ExpenseForm
        categories={categories}
        expense={expense}
        redirectTo="/history"
      />
    </div>
  );
}
