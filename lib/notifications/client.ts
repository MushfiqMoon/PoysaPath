import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

export async function fetchUnreadNotifications(): Promise<Notification[]> {
  const supabase = createClient();
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
