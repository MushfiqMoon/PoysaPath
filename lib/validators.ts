import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constants";

import type { StoredPaymentMethod } from "@/lib/constants";

type PaymentMethodValue = StoredPaymentMethod;

const paymentValues: [PaymentMethodValue, ...PaymentMethodValue[]] = [
  "credit_card",
  "debit_card",
  "mobile_wallet",
  "cash",
  "other",
  "bkash",
  "nagad",
  "card",
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
