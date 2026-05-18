import { AddExpenseTabs } from "@/components/add-expense-tabs";
import { getAuthUser } from "@/lib/auth/session";
import { getUserCategories } from "@/lib/data/categories";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";

export default async function AddPage() {
  const [categories, user] = await Promise.all([
    getUserCategories(),
    getAuthUser(),
  ]);
  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Add expense</h2>
      <AddExpenseTabs
        categories={categories}
        hasGeminiKey={geminiStatus.hasKey}
      />
    </div>
  );
}
