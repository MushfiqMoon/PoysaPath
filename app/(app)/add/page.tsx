import { AddExpenseTabs } from "@/components/add-expense-tabs";
import { getUserCategories } from "@/lib/data/categories";

export default async function AddPage() {
  const categories = await getUserCategories();

  return (
    <div className="min-w-0 space-y-4">
      <h2 className="text-lg font-semibold text-text">Add expense</h2>
      <AddExpenseTabs categories={categories} />
    </div>
  );
}
