import { PageHeader } from "@/components/layout/page-header";
import { MonthlyReportCard } from "@/components/reports/monthly-report-card";
import { getAuthUser } from "@/lib/auth/session";
import { getGeminiKeyStatus } from "@/lib/data/gemini-credentials";
import {
  listMonthlyReports,
  getProfileReportLanguage,
} from "@/lib/data/monthly-reports";
import { getMonthStartInDhaka } from "@/lib/dates";
import { monthlyReportResponseSchema } from "@/lib/gemini/schemas";

function parseStoredReport(content: string) {
  try {
    return monthlyReportResponseSchema.parse(JSON.parse(content));
  } catch {
    return null;
  }
}

export default async function SettingsReportsPage() {
  const user = await getAuthUser();
  const currentMonth = getMonthStartInDhaka();
  const geminiStatus = user
    ? await getGeminiKeyStatus(user.id)
    : { hasKey: false, keyHint: null };
  const defaultLanguage = user ? await getProfileReportLanguage(user.id) : "en";
  const savedReports = user ? await listMonthlyReports(user.id) : [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Monthly report"
        backHref="/settings"
        backLabel="Settings"
      />
      <MonthlyReportCard
        hasGeminiKey={geminiStatus.hasKey}
        currentMonth={currentMonth}
        initialLanguage={defaultLanguage}
        initialSavedReports={savedReports.map((report) => ({
          id: report.id,
          reportMonth: report.report_month,
          language: report.language,
          content: report.content,
          generatedAt: report.generated_at,
          createdAt: report.created_at,
          report: parseStoredReport(report.content),
        }))}
      />
    </div>
  );
}
