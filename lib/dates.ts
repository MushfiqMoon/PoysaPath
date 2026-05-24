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

/** First day of month, offset by `months` from a YYYY-MM-01 anchor. */
export function addMonthsToMonthStart(monthStart: string, months: number): string {
  const [y, m] = monthStart.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

/** Month starts from `from` through `to`, inclusive, newest first. */
export function listMonthStarts(from: string, to: string): string[] {
  const result: string[] = [];
  let current = to;
  while (current >= from) {
    result.push(current);
    if (current === from) break;
    current = addMonthsToMonthStart(current, -1);
  }
  return result;
}

export function monthStartToParam(monthStart: string): string {
  return monthStart.slice(0, 7);
}

export function parseMonthStartParam(
  value: string | undefined,
  fallback: string,
): string {
  if (!value) return fallback;

  const normalized = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return fallback;

  const [y, m, d] = normalized.split("-").map(Number);
  if (d !== 1 || m < 1 || m > 12) return fallback;

  const current = getMonthStartInDhaka();
  if (normalized > current) return fallback;

  return normalized;
}

export function formatMonthLabel(
  monthStart: string,
  currentMonthStart = getMonthStartInDhaka(),
): string {
  if (monthStart === currentMonthStart) return "This month";

  const [y, m] = monthStart.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(Date.UTC(y, m - 1, 1)));
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

export type DateRangeYmd = { start: string; end: string };

/** Last 7 calendar days in Dhaka including today (start = today − 6 days). */
export function getRolling7DayRangeInDhaka(): DateRangeYmd {
  const end = getTodayInDhaka();
  return { start: addDaysYmd(end, -6), end };
}

/** Cache key for rolling insight (`insight_cache.week_start` = anchor day). */
export function getInsightCachePeriodKeyInDhaka(): string {
  return getTodayInDhaka();
}
