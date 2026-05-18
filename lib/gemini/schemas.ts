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

export const parseExpenseRequestSchema = z.object({
  text: z.string().min(1).max(500),
});
