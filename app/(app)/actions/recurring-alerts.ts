"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import {
  dismissRecurringPaymentAlert,
  getPaymentReminderNotifications,
} from "@/lib/data/recurring-alerts";
import { parseRecurringAlertId } from "@/lib/recurring-alert-id";

export async function fetchPaymentReminderNotifications() {
  return getPaymentReminderNotifications();
}

export async function dismissRecurringPaymentAlertAction(alertId: string) {
  const parsed = parseRecurringAlertId(alertId);
  if (!parsed) {
    throw new Error("Invalid payment reminder.");
  }

  const { user } = await requireActionUser();
  await dismissRecurringPaymentAlert(
    user.id,
    parsed.recurringItemId,
    parsed.alertKind,
    parsed.dueDate,
  );

  revalidatePath("/dashboard");
  revalidatePath("/settings/recurring", "layout");
}
