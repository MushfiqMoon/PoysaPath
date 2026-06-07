import { AddMoneyTabs } from "@/components/expenses/add-money-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { getAuthUser } from "@/lib/auth/session";
import { getExpenseCategories, getIncomeCategories } from "@/lib/data/categories";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";

type AddPageProps = {
  searchParams: Promise<{ flow?: string }>;
};

export default async function AddPage({ searchParams }: AddPageProps) {
  const { flow } = await searchParams;
  const [expenseCategories, incomeCategories, user] = await Promise.all([
    getExpenseCategories(),
    getIncomeCategories(),
    getAuthUser(),
  ]);
  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  const initialFlow = flow === "income" ? "income" : "expense";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Add"
        description={
          initialFlow === "income"
            ? "Add a new income transaction"
            : geminiStatus.hasKey
              ? "Quick parse or manual entry"
              : "Manual expense entry"
        }
      />
      <AddMoneyTabs
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        hasGeminiKey={geminiStatus.hasKey}
        initialFlow={initialFlow}
      />
    </div>
  );
}
