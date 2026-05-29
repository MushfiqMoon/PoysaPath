import type { RecurringAlertKind } from "@/lib/types";

export const RECURRING_ALERT_ID_PREFIX = "recurring:";

export function buildRecurringAlertId(
  recurringItemId: string,
  alertKind: RecurringAlertKind,
  dueDate: string,
) {
  return `${RECURRING_ALERT_ID_PREFIX}${recurringItemId}:${alertKind}:${dueDate}`;
}

export function parseRecurringAlertId(id: string): {
  recurringItemId: string;
  alertKind: RecurringAlertKind;
  dueDate: string;
} | null {
  if (!id.startsWith(RECURRING_ALERT_ID_PREFIX)) return null;
  const parts = id.slice(RECURRING_ALERT_ID_PREFIX.length).split(":");
  if (parts.length !== 3) return null;
  const [recurringItemId, alertKind, dueDate] = parts;
  if (alertKind !== "due_soon" && alertKind !== "missed") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
  return { recurringItemId, alertKind, dueDate };
}
