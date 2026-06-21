"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import { areUsersConnected } from "@/lib/data/connections";
import {
  getUnreadInboxNotifications,
  inboxToBellNotifications,
  markInboxNotificationRead,
} from "@/lib/data/inbox-notifications";
import { sharedReminderInputSchema } from "@/lib/validators";

function revalidateReminderPages() {
  revalidatePath("/settings/profile", "layout");
  revalidatePath("/settings/follow-ups", "layout");
  revalidatePath("/dashboard");
}

function profileDisplayName(displayName: string | null | undefined, fallback: string) {
  return displayName?.trim() || fallback;
}

export async function fetchSharedReminderInboxNotifications() {
  const items = await getUnreadInboxNotifications();
  return inboxToBellNotifications(items);
}

export async function markInboxNotificationReadAction(notificationId: string) {
  await markInboxNotificationRead(notificationId);
  revalidateReminderPages();
}

export async function createSharedReminderAction(input: {
  assignee_id: string;
  title: string;
  note?: string | null;
  due_at?: string | null;
}) {
  const parsed = sharedReminderInputSchema.parse(input);
  const { supabase, user } = await requireActionUser();

  if (parsed.assignee_id === user.id) {
    throw new Error("Pick someone you are connected with.");
  }

  const connected = await areUsersConnected(supabase, user.id, parsed.assignee_id);
  if (!connected) {
    throw new Error("You can only send reminders to a connected person.");
  }

  const dueAt = parsed.due_at ? `${parsed.due_at}T12:00:00.000Z` : null;

  const { data: reminder, error } = await supabase
    .from("shared_reminders")
    .insert({
      creator_id: user.id,
      assignee_id: parsed.assignee_id,
      title: parsed.title,
      note: parsed.note ?? null,
      due_at: dueAt,
      status: "open",
    })
    .select("id, title")
    .single();

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 024_connections_shared_reminders.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const creatorName = profileDisplayName(creatorProfile?.display_name, "Someone");

  const { error: inboxError } = await supabase.from("user_inbox_notifications").insert({
    user_id: parsed.assignee_id,
    shared_reminder_id: reminder.id,
    kind: "shared_reminder_assigned",
    title: "Reminder",
    body: `You got a reminder from ${creatorName} about ${reminder.title}`,
  });

  if (inboxError) throw new Error(inboxError.message);

  revalidateReminderPages();
}

export async function completeSharedReminderAction(reminderId: string) {
  const { supabase, user } = await requireActionUser();
  const now = new Date().toISOString();

  const { data: reminder, error: fetchError } = await supabase
    .from("shared_reminders")
    .select("id, creator_id, assignee_id, title, status")
    .eq("id", reminderId)
    .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!reminder || reminder.status !== "open") {
    throw new Error("Reminder not found or already completed.");
  }

  const { error: updateError } = await supabase
    .from("shared_reminders")
    .update({
      status: "done",
      completed_at: now,
      completed_by: user.id,
    })
    .eq("id", reminderId)
    .eq("status", "open");

  if (updateError) throw new Error(updateError.message);

  const notifyUserId =
    user.id === reminder.assignee_id ? reminder.creator_id : reminder.assignee_id;

  if (notifyUserId !== user.id) {
    const { data: actorProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const actorName = profileDisplayName(actorProfile?.display_name, "Someone");

    await supabase.from("user_inbox_notifications").insert({
      user_id: notifyUserId,
      shared_reminder_id: reminder.id,
      kind: "shared_reminder_done",
      title: "Reminder",
      body: `${actorName} marked "${reminder.title}" as done`,
    });
  }

  revalidateReminderPages();
}
