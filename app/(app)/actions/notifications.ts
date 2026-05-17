"use server";

import { markNotificationRead } from "@/lib/data/notifications";

export async function markNotificationReadAction(notificationId: string) {
  await markNotificationRead(notificationId);
}
