import { PageHeader } from "@/components/layout/page-header";
import { MonthlyReportCard } from "@/components/reports/monthly-report-card";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";

export default async function SettingsReportsPage() {
  const user = await getAuthUser();
  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Monthly report"
        backHref="/settings"
        backLabel="Settings"
      />
      <MonthlyReportCard hasGeminiKey={geminiStatus.hasKey} />
    </div>
  );
}
