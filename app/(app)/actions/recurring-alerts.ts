"use server";

import { revalidatePath } from "next/cache";

import {
  dismissRecurringPaymentAlert,
  getPaymentReminderNotifications,
} from "@/lib/data/recurring-alerts";
import { parseRecurringAlertId } from "@/lib/recurring-alert-id";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("You must be logged in.");
  return { user };
}

export async function fetchPaymentReminderNotifications() {
  return getPaymentReminderNotifications();
}

export async function dismissRecurringPaymentAlertAction(alertId: string) {
  const parsed = parseRecurringAlertId(alertId);
  if (!parsed) {
    throw new Error("Invalid payment reminder.");
  }

  const { user } = await requireUser();
  await dismissRecurringPaymentAlert(
    user.id,
    parsed.recurringItemId,
    parsed.alertKind,
    parsed.dueDate,
  );

  revalidatePath("/dashboard");
  revalidatePath("/settings/recurring");
}
