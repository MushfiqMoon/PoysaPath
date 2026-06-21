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
      "id, user_id, shared_reminder_id, connection_request_id, kind, title, body, read_at, created_at",
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

function inboxSourceForKind(
  kind: InboxNotification["kind"],
): BellNotification["source"] {
  if (kind === "connection_request_received") return "connection";
  return "shared_reminder";
}

function inboxHrefForKind(kind: InboxNotification["kind"]): string {
  if (kind === "connection_request_received") return "/settings/profile";
  return "/settings/follow-ups";
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
    source: inboxSourceForKind(n.kind),
    href: inboxHrefForKind(n.kind),
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

export async function markConnectionRequestInboxRead(
  connectionRequestId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_inbox_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("connection_request_id", connectionRequestId)
    .eq("kind", "connection_request_received")
    .is("read_at", null);

  if (error && error.code !== "42P01") {
    throw new Error(error.message);
  }
}
