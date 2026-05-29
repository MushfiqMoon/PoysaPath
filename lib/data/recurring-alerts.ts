import { getRecurringItems } from "@/lib/data/recurring";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { buildRecurringAlertId } from "@/lib/recurring-alert-id";
import { createClient } from "@/lib/supabase/server";
import type { BellNotification, RecurringAlertKind } from "@/lib/types";

type DismissalRow = {
  recurring_item_id: string;
  alert_kind: RecurringAlertKind;
  due_date: string;
};

function dismissalKey(
  recurringItemId: string,
  alertKind: RecurringAlertKind,
  dueDate: string,
) {
  return `${recurringItemId}:${alertKind}:${dueDate}`;
}

async function getDismissedKeys(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_recurring_alert_dismissals")
    .select("recurring_item_id, alert_kind, due_date")
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42P01") return new Set();
    throw new Error(error.message);
  }

  return new Set(
    ((data ?? []) as DismissalRow[]).map((row) =>
      dismissalKey(row.recurring_item_id, row.alert_kind, row.due_date),
    ),
  );
}

export async function getPaymentReminderNotifications(): Promise<BellNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [items, dismissed] = await Promise.all([
    getRecurringItems(),
    getDismissedKeys(user.id),
  ]);

  const alerts: BellNotification[] = [];

  for (const item of items) {
    if (!item.is_active) continue;
    if (item.status !== "due_soon" && item.status !== "missed") continue;

    const alertKind: RecurringAlertKind =
      item.status === "missed" ? "missed" : "due_soon";

    if (dismissed.has(dismissalKey(item.id, alertKind, item.next_due_date))) {
      continue;
    }

    const dueLabel = formatRelativeDay(item.next_due_date);
    const title =
      alertKind === "missed"
        ? `Missed: ${item.title}`
        : `Due soon: ${item.title}`;

    alerts.push({
      id: buildRecurringAlertId(item.id, alertKind, item.next_due_date),
      title,
      body: `${formatCurrency(item.amount)} due ${dueLabel}. Tap to manage recurring payments.`,
      kind:
        alertKind === "missed" ? "recurring_missed" : "recurring_due_soon",
      created_at: `${item.next_due_date}T00:00:00.000Z`,
      source: "recurring",
      href: "/settings/recurring",
    });
  }

  alerts.sort((a, b) => {
    const aMissed = a.kind === "recurring_missed" ? 0 : 1;
    const bMissed = b.kind === "recurring_missed" ? 0 : 1;
    if (aMissed !== bMissed) return aMissed - bMissed;
    return a.created_at.localeCompare(b.created_at);
  });

  return alerts;
}

export async function dismissRecurringPaymentAlert(
  userId: string,
  recurringItemId: string,
  alertKind: RecurringAlertKind,
  dueDate: string,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_recurring_alert_dismissals").upsert(
    {
      user_id: userId,
      recurring_item_id: recurringItemId,
      alert_kind: alertKind,
      due_date: dueDate,
    },
    { onConflict: "user_id,recurring_item_id,alert_kind,due_date" },
  );

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 014_recurring_alert_dismissals.sql in Supabase.");
    }
    throw new Error(error.message);
  }
}
