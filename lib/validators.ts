import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constants";

const paymentValues = PAYMENT_METHODS.map((p) => p.value) as [
  string,
  ...string[],
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
