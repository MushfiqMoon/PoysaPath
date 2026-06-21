import { createClient } from "@/lib/supabase/server";
import type { BellNotification, InboxNotification } from "@/lib/types";

export async function getUnreadInboxNotifications(): Promise<InboxNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_inbox_notifications")
    .select(
      "id, user_id, shared_reminder_id, kind, title, body, read_at, created_at",
    )
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  return (data ?? []) as InboxNotification[];
}

export function inboxToBellNotifications(
  items: InboxNotification[],
): BellNotification[] {
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    kind: n.kind,
    created_at: n.created_at,
    source: "shared_reminder" as const,
    href: "/settings/connections",
  }));
}

export async function markInboxNotificationRead(
  notificationId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("user_inbox_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
