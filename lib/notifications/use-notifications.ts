"use client";

import { useCallback, useEffect, useState } from "react";

import {
  dismissRecurringPaymentAlertAction,
  fetchPaymentReminderNotifications,
} from "@/app/(app)/actions/recurring-alerts";
import { markNotificationReadAction } from "@/app/(app)/actions/notifications";
import {
  fetchSharedReminderInboxNotifications,
  markInboxNotificationReadAction,
} from "@/app/(app)/actions/shared-reminders";
import { RECURRING_ALERT_ID_PREFIX } from "@/lib/recurring-alert-id";
import { fetchUnreadNotifications } from "@/lib/notifications/client";
import type { BellNotification } from "@/lib/types";

function toAnnouncementItems(
  items: Awaited<ReturnType<typeof fetchUnreadNotifications>>,
): BellNotification[] {
  return items.map((n) => ({ ...n, source: "announcement" as const }));
}

export function useNotifications() {
  const [items, setItems] = useState<BellNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [announcements, recurring, shared] = await Promise.all([
        fetchUnreadNotifications(),
        fetchPaymentReminderNotifications(),
        fetchSharedReminderInboxNotifications(),
      ]);
      setItems([
        ...shared,
        ...recurring,
        ...toAnnouncementItems(announcements),
      ]);
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(notificationId: string) {
    setMarkingId(notificationId);
    setError(null);
    try {
      const item = items.find((n) => n.id === notificationId);
      if (item?.source === "shared_reminder") {
        await markInboxNotificationReadAction(notificationId);
      } else if (notificationId.startsWith(RECURRING_ALERT_ID_PREFIX)) {
        await dismissRecurringPaymentAlertAction(notificationId);
      } else {
        await markNotificationReadAction(notificationId);
      }
      setItems((prev) => prev.filter((n) => n.id !== notificationId));
    } catch {
      setError("Could not mark as read. Try again.");
    } finally {
      setMarkingId(null);
    }
  }

  return {
    items,
    loading,
    markingId,
    error,
    unreadCount: items.length,
    load,
    markRead,
  };
}
