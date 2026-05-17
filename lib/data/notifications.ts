import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

/** Notifications the current user has not marked read yet. */
export async function getUnreadNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: all, error: listError } = await supabase
    .from("notifications")
    .select("id, title, body, kind, created_at")
    .order("created_at", { ascending: false });

  if (listError || !all?.length) return [];

  const { data: reads, error: readsError } = await supabase
    .from("user_notification_reads")
    .select("notification_id")
    .eq("user_id", user.id);

  if (readsError) return [];

  const readIds = new Set((reads ?? []).map((r) => r.notification_id));
  return all.filter((n) => !readIds.has(n.id)) as Notification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("user_notification_reads").upsert(
    {
      user_id: user.id,
      notification_id: notificationId,
      read_at: new Date().toISOString(),
    },
    { onConflict: "user_id,notification_id" },
  );

  if (error) throw new Error(error.message);
}
