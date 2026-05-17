import { TIMEZONE } from "@/lib/constants";

function formatParts(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
}

function toYmd(parts: Intl.DateTimeFormatPart[]) {
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function getTodayInDhaka(): string {
  return toYmd(formatParts(new Date()));
}

export function getMonthStartInDhaka(date = new Date()): string {
  const parts = formatParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}-01`;
}

export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Monday of the current week in Asia/Dhaka (YYYY-MM-DD). */
export function getWeekStartInDhaka(): string {
  const today = getTodayInDhaka();
  const [y, m, d] = today.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const day = utc.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysYmd(today, diff);
}

export function getWeekEndExclusive(weekStart: string): string {
  return addDaysYmd(weekStart, 7);
}
