import { z } from "zod";

export const parseExpenseResponseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().nullable().optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const weeklyInsightResponseSchema = z.object({
  insight: z.string().min(1),
});

export const monthlyReportLanguageSchema = z.enum(["en", "bn"]);

export const monthlyReportResponseSchema = z.object({
  title: z.string().min(1),
  overview: z.string().min(1),
  wins: z.array(z.string().min(1)).min(1).max(4),
  watchouts: z.array(z.string().min(1)).min(1).max(4),
  categoryChanges: z.array(z.string().min(1)).min(1).max(4),
  nextMonthPlan: z.array(z.string().min(1)).min(1).max(4),
});

export const parseExpenseRequestSchema = z.object({
  text: z.string().min(1).max(500),
});

export const monthlyReportRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  language: monthlyReportLanguageSchema.optional(),
  refresh: z.boolean().optional(),
});

export type MonthlyReport = z.infer<typeof monthlyReportResponseSchema>;
