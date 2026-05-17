export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export type LegacyPaymentMethod = "bkash" | "nagad" | "card";

export type StoredPaymentMethod = PaymentMethod | LegacyPaymentMethod;

/** Labels for values saved before payment options were updated */
const LEGACY_PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
};

export function formatPaymentMethod(value: string | null | undefined): string | null {
  if (!value) return null;
  const current = PAYMENT_METHODS.find((p) => p.value === value);
  if (current) return current.label;
  return LEGACY_PAYMENT_LABELS[value] ?? value;
}

export const TIMEZONE = "Asia/Dhaka";
