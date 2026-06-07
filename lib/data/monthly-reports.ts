import { createClient } from "@/lib/supabase/server";
import {
  type MonthlyReportLanguage,
  normalizeMonthlyReportLanguage,
} from "@/lib/monthly-report-language";

export type { MonthlyReportLanguage } from "@/lib/monthly-report-language";
export {
  MONTHLY_REPORT_LANGUAGES,
  normalizeMonthlyReportLanguage,
} from "@/lib/monthly-report-language";

export type MonthlyReportRecord = {
  id: string;
  report_month: string;
  language: MonthlyReportLanguage;
  content: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  model: string | null;
};

export type SaveMonthlyReportInput = {
  userId: string;
  reportMonth: string;
  language: MonthlyReportLanguage;
  content: string;
  inputSnapshot?: unknown;
  model: string | null;
  generatedAt?: string;
};

export const MONTHLY_REPORT_DUPLICATE_MESSAGE =
  "A report is already saved for this month. Delete it before saving another.";

function mapMonthlyReportRecord(row: MonthlyReportRecord): MonthlyReportRecord {
  return {
    id: row.id,
    report_month: row.report_month,
    language: normalizeMonthlyReportLanguage(row.language),
    content: row.content,
    generated_at: row.generated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    model: row.model,
  };
}

export async function getProfileReportLanguage(
  userId: string,
): Promise<MonthlyReportLanguage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("monthly_report_language")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "42703") return "en";
    throw new Error(error.message);
  }

  return normalizeMonthlyReportLanguage(data?.monthly_report_language);
}

export async function updateProfileReportLanguage(
  userId: string,
  language: MonthlyReportLanguage,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      monthly_report_language: language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    if (error.code === "42703") return;
    throw new Error(error.message);
  }
}

export async function getMonthlyReport(
  userId: string,
  reportMonth: string,
): Promise<MonthlyReportRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_ai_reports")
    .select("id, report_month, language, content, generated_at, created_at, updated_at, model")
    .eq("user_id", userId)
    .eq("report_month", reportMonth)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapMonthlyReportRecord(data);
}

export async function listMonthlyReports(
  userId: string,
): Promise<MonthlyReportRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_ai_reports")
    .select("id, report_month, language, content, generated_at, created_at, updated_at, model")
    .eq("user_id", userId)
    .order("report_month", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMonthlyReportRecord);
}

function isUniqueViolation(error: { code?: string }) {
  return error.code === "23505";
}

export async function saveMonthlyReport({
  userId,
  reportMonth,
  language,
  content,
  inputSnapshot,
  model,
  generatedAt,
}: SaveMonthlyReportInput): Promise<MonthlyReportRecord> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_ai_reports")
    .insert({
      user_id: userId,
      report_month: reportMonth,
      language,
      content,
      input_snapshot: inputSnapshot ?? null,
      model,
      generated_at: generatedAt ?? new Date().toISOString(),
    })
    .select("id, report_month, language, content, generated_at, created_at, updated_at, model")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      throw new Error(MONTHLY_REPORT_DUPLICATE_MESSAGE);
    }
    throw new Error(error.message);
  }

  return mapMonthlyReportRecord(data);
}

export async function deleteMonthlyReportForMonth(
  userId: string,
  reportMonth: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("monthly_ai_reports")
    .delete()
    .eq("user_id", userId)
    .eq("report_month", reportMonth);

  if (error) throw new Error(error.message);
}
