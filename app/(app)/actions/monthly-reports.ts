"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import { parseMonthStartParam } from "@/lib/dates";
import {
  deleteMonthlyReportForMonth,
  normalizeMonthlyReportLanguage,
  saveMonthlyReport,
  updateProfileReportLanguage,
} from "@/lib/data/monthly-reports";
import { GEMINI_MODEL } from "@/lib/gemini/client";
import { monthlyReportResponseSchema } from "@/lib/gemini/schemas";

type SaveGeneratedMonthlyReportInput = {
  reportMonth: string;
  language: string;
  content: string;
  generatedAt?: string | null;
};

function parseReportMonth(value: string) {
  const reportMonth = parseMonthStartParam(value, "");
  if (!reportMonth) throw new Error("Choose a valid report month.");

  return reportMonth;
}

function normalizeGeneratedAt(value: string | null | undefined) {
  if (!value) return new Date().toISOString();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();

  return date.toISOString();
}

function normalizeReportContent(content: string) {
  try {
    const report = monthlyReportResponseSchema.parse(JSON.parse(content));
    return JSON.stringify(report);
  } catch {
    throw new Error("Generate a valid report before saving.");
  }
}

export async function saveMonthlyReportLanguage(language: string) {
  const { user } = await requireActionUser();

  await updateProfileReportLanguage(
    user.id,
    normalizeMonthlyReportLanguage(language),
  );

  revalidatePath("/settings/profile");
  revalidatePath("/settings/reports");
}

export async function saveGeneratedMonthlyReport({
  reportMonth: rawReportMonth,
  language: rawLanguage,
  content,
  generatedAt,
}: SaveGeneratedMonthlyReportInput) {
  const { user } = await requireActionUser();
  const reportMonth = parseReportMonth(rawReportMonth);
  const language = normalizeMonthlyReportLanguage(rawLanguage);
  const normalizedContent = normalizeReportContent(content);

  const savedReport = await saveMonthlyReport({
    userId: user.id,
    reportMonth,
    language,
    content: normalizedContent,
    inputSnapshot: { source: "manual_save", reportMonth, language },
    model: GEMINI_MODEL,
    generatedAt: normalizeGeneratedAt(generatedAt),
  });

  revalidatePath("/settings/reports");

  return savedReport;
}

export async function deleteMonthlyReport(reportMonth: string) {
  const { user } = await requireActionUser();

  await deleteMonthlyReportForMonth(user.id, parseReportMonth(reportMonth));

  revalidatePath("/settings/reports");
}
