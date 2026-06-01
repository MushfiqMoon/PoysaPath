import { TIMEZONE } from "@/lib/constants";
import { addDaysYmd, getTodayInDhaka } from "@/lib/dates";

export function formatCurrency(amount: number): string {
  const rounded = Number.isInteger(amount) ? amount : amount;
  return `৳${rounded.toLocaleString("en-BD", {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })}`;
}

export function formatRelativeDay(ymd: string): string {
  const today = getTodayInDhaka();
  if (ymd === today) return "Today";
  if (ymd === addDaysYmd(today, -1)) return "Yesterday";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export function formatExpenseTitle(note: string | null, categoryName: string) {
  return note?.trim() || categoryName;
}

export function formatDateTimeDhaka(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
