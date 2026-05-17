"use client";

import { useCallback, useEffect, useState } from "react";

import { markNotificationReadAction } from "@/app/(app)/actions/notifications";
import { fetchUnreadNotifications } from "@/lib/notifications/client";
import type { Notification } from "@/lib/types";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const unread = await fetchUnreadNotifications();
      setItems(unread);
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
      await markNotificationReadAction(notificationId);
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
