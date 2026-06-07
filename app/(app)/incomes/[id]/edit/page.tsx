import { BackLink } from "@/components/shared/back-link";
import { IncomeForm } from "@/components/income/income-form";
import { getIncomeCategories } from "@/lib/data/categories";
import { getIncomeById } from "@/lib/data/incomes";
import { notFound } from "next/navigation";

type EditIncomePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditIncomePage({ params }: EditIncomePageProps) {
  const { id } = await params;
  const [categories, income] = await Promise.all([
    getIncomeCategories(),
    getIncomeById(id),
  ]);

  if (!income) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <BackLink href="/history?tab=income">Back to history</BackLink>
      <h2 className="text-lg font-semibold text-text">Edit income</h2>
      <IncomeForm
        categories={categories}
        income={income}
        redirectTo="/history?tab=income"
      />
    </div>
  );
}
