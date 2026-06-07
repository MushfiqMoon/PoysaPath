export type MonthlyReportLanguage = "en" | "bn";

export const MONTHLY_REPORT_LANGUAGES: {
  value: MonthlyReportLanguage;
  label: string;
}[] = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
];

export function normalizeMonthlyReportLanguage(
  value: unknown,
): MonthlyReportLanguage {
  return value === "bn" ? "bn" : "en";
}
