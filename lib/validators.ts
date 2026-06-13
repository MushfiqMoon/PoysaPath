import { z } from "zod";

import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";

const paymentValues = PAYMENT_METHODS.map((p) => p.value) as [
  PaymentMethod,
  ...PaymentMethod[],
];

export const expenseInputSchema = z.object({
  amount: z.coerce.number().positive("Enter a valid amount"),
  category_id: z.string().uuid("Pick a category"),
  expense_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  note: z.string().max(500).optional().nullable(),
  payment_method: z
    .union([z.enum(paymentValues), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;

export const incomeInputSchema = z.object({
  amount: z.coerce.number().positive("Enter a valid amount"),
  category_id: z.string().uuid("Pick a category"),
  income_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  note: z.string().max(500).optional().nullable(),
  payment_method: z
    .union([z.enum(paymentValues), z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
});

export type IncomeInput = z.infer<typeof incomeInputSchema>;

export const financialGoalInputSchema = z
  .object({
    title: z.string().trim().min(2, "Name your goal").max(80),
    goal_type: z.enum(["savings", "debt_payoff", "category_challenge"]),
    category_id: z.string().uuid().optional().nullable(),
    target_amount: z.coerce.number().positive("Enter a target amount"),
    current_amount: z.coerce.number().min(0).optional().default(0),
    target_month: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    show_on_dashboard: z.coerce.boolean().optional().default(false),
  })
  .superRefine((value, ctx) => {
    if (value.goal_type === "category_challenge") {
      if (!value.category_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category_id"],
          message: "Pick a category for the challenge",
        });
      }
      if (!value.target_month) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["target_month"],
          message: "Pick a month for the challenge",
        });
      }
    }
  });

export type FinancialGoalInput = z.infer<typeof financialGoalInputSchema>;

export const recurringItemInputSchema = z
  .object({
    title: z.string().trim().min(2, "Name this recurring item").max(80),
    recurring_type: z.literal("expense").default("expense"),
    amount: z.coerce.number().positive("Enter an amount"),
    category_id: z.string().uuid().optional().nullable(),
    payment_method: z
      .union([z.enum(paymentValues), z.literal("")])
      .optional()
      .nullable()
      .transform((v) => (v === "" ? null : v)),
    frequency: z.enum(["weekly", "monthly", "yearly"]),
    next_due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid due date"),
    reminder_days: z.coerce.number().int().min(0).max(30).default(3),
    notes: z.string().max(500).optional().nullable(),
    linked_goal_id: z
      .union([z.string().uuid(), z.literal("")])
      .optional()
      .nullable()
      .transform((v) => (v === "" || v == null ? null : v)),
  })
  .superRefine((value, ctx) => {
    if (!value.category_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category_id"],
        message: "Pick a category for recurring payments",
      });
    }
  });

export type RecurringItemInput = z.infer<typeof recurringItemInputSchema>;

export const oneTimeInvestmentInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Title is too long"),
  description: z.string().max(500).optional().nullable(),
  amount: z.coerce.number().positive("Enter a valid amount"),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  payment_note: z.string().max(500).optional().nullable(),
});

export type OneTimeInvestmentInput = z.infer<typeof oneTimeInvestmentInputSchema>;

export const multiPaymentProjectInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Title is too long"),
  description: z.string().max(500).optional().nullable(),
  target_amount: z.coerce.number().positive("Enter a target amount"),
});

export type MultiPaymentProjectInput = z.infer<
  typeof multiPaymentProjectInputSchema
>;

export const investmentProjectUpdateSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Title is too long"),
  description: z.string().max(500).optional().nullable(),
  target_amount: z.coerce.number().positive("Enter a target amount").optional(),
  status: z.enum(["active", "completed"]).optional(),
});

export type InvestmentProjectUpdateInput = z.infer<
  typeof investmentProjectUpdateSchema
>;

export const investmentPaymentInputSchema = z.object({
  amount: z.coerce.number().positive("Enter a valid amount"),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  note: z.string().max(500).optional().nullable(),
});

export type InvestmentPaymentInput = z.infer<typeof investmentPaymentInputSchema>;
