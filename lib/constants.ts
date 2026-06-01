export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((p) => p.value);

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHOD_VALUES.includes(value as PaymentMethod);
}

/** Normalize deprecated stored values (see migration 017). */
export function coercePaymentMethod(
  value: string | null | undefined,
): PaymentMethod | null {
  if (!value) return null;
  if (value === "bkash" || value === "nagad") return "mobile_wallet";
  if (value === "card") return "credit_card";
  return isPaymentMethod(value) ? value : null;
}

export function formatPaymentMethod(value: string | null | undefined): string | null {
  const coerced = coercePaymentMethod(value);
  if (!coerced) return null;
  return PAYMENT_METHODS.find((p) => p.value === coerced)?.label ?? null;
}

export const TIMEZONE = "Asia/Dhaka";

/** Minimum time between manual weekly-insight refreshes (client + server). */
export const INSIGHT_REFRESH_COOLDOWN_MS = 1 * 60 * 60 * 1000;
