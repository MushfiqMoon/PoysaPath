"use server";

import { revalidatePath } from "next/cache";

import { requireActionUser } from "@/lib/auth/action-user";
import {
  areUsersConnected,
  searchConnectionCandidateByEmail,
} from "@/lib/data/connections";
import { connectionInviteInputSchema } from "@/lib/validators";
import type { ConnectionSearchResult } from "@/lib/types";

function revalidateConnectionPages() {
  revalidatePath("/settings/connections", "layout");
  revalidatePath("/dashboard");
}

async function findAcceptedConnectionId(
  supabase: Awaited<ReturnType<typeof import("@/lib/auth/action-user").requireActionUser>>["supabase"],
  userId: string,
  otherUserId: string,
) {
  const { data, error } = await supabase
    .from("connection_requests")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${userId},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${userId})`,
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function findActiveConnectionRequest(
  supabase: Awaited<ReturnType<typeof import("@/lib/auth/action-user").requireActionUser>>["supabase"],
  userId: string,
  otherUserId: string,
) {
  const { data, error } = await supabase
    .from("connection_requests")
    .select("id, status, requester_id")
    .in("status", ["pending", "accepted"])
    .or(
      `and(requester_id.eq.${userId},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${userId})`,
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function searchConnectionByEmailAction(
  email: string,
): Promise<ConnectionSearchResult | null> {
  const parsed = connectionInviteInputSchema.parse({ email });
  const { supabase, user } = await requireActionUser();

  const candidate = await searchConnectionCandidateByEmail(parsed.email);
  if (!candidate) return null;

  const existing = await findActiveConnectionRequest(
    supabase,
    user.id,
    candidate.id,
  );

  if (existing?.status === "accepted") {
    return {
      user: candidate,
      canInvite: false,
      statusMessage: "You are already connected with this person.",
    };
  }

  if (existing?.status === "pending") {
    if (existing.requester_id === user.id) {
      return {
        user: candidate,
        canInvite: false,
        statusMessage: "A connection request is already pending with this person.",
      };
    }
    return {
      user: candidate,
      canInvite: false,
      statusMessage: "This person has already sent you a connection request.",
    };
  }

  return {
    user: candidate,
    canInvite: true,
    statusMessage: null,
  };
}

async function insertConnectionRequest(
  supabase: Awaited<ReturnType<typeof import("@/lib/auth/action-user").requireActionUser>>["supabase"],
  requesterId: string,
  recipientId: string,
) {
  const { error } = await supabase.from("connection_requests").insert({
    requester_id: requesterId,
    recipient_id: recipientId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("A connection request is already pending with this person.");
    }
    if (error.code === "42P01") {
      throw new Error("Run migration 024_connections_shared_reminders.sql in Supabase.");
    }
    throw new Error(error.message);
  }
}

export async function sendConnectionRequestAction(recipientId: string) {
  const { supabase, user } = await requireActionUser();

  if (!recipientId || recipientId === user.id) {
    throw new Error("You cannot connect with yourself.");
  }

  const alreadyConnected = await areUsersConnected(supabase, user.id, recipientId);
  if (alreadyConnected) {
    throw new Error("You are already connected with this person.");
  }

  const existing = await findActiveConnectionRequest(supabase, user.id, recipientId);
  if (existing?.status === "pending") {
    throw new Error("A connection request is already pending with this person.");
  }

  await insertConnectionRequest(supabase, user.id, recipientId);
  revalidateConnectionPages();
}

export async function acceptConnectionRequestAction(requestId: string) {
  const { supabase, user } = await requireActionUser();

  const { data, error } = await supabase
    .from("connection_requests")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      throw new Error("Run migration 024_connections_shared_reminders.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Connection request not found or already handled.");
  }

  revalidateConnectionPages();
}

export async function declineConnectionRequestAction(requestId: string) {
  const { supabase, user } = await requireActionUser();

  const { data, error } = await supabase
    .from("connection_requests")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Connection request not found or already handled.");

  revalidateConnectionPages();
}

export async function cancelConnectionRequestAction(requestId: string) {
  const { supabase, user } = await requireActionUser();

  const { data, error } = await supabase
    .from("connection_requests")
    .update({
      status: "cancelled",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Connection request not found or already handled.");

  revalidateConnectionPages();
}

export async function removeConnectionAction(otherUserId: string) {
  const { supabase, user } = await requireActionUser();

  const connectionId = await findAcceptedConnectionId(supabase, user.id, otherUserId);
  if (!connectionId) {
    throw new Error("Connection not found.");
  }

  const now = new Date().toISOString();

  const { error: connectionError } = await supabase
    .from("connection_requests")
    .update({ status: "removed", responded_at: now })
    .eq("id", connectionId)
    .eq("status", "accepted");

  if (connectionError) throw new Error(connectionError.message);

  const { error: reminderError } = await supabase
    .from("shared_reminders")
    .update({ status: "cancelled", updated_at: now })
    .eq("status", "open")
    .or(
      `and(creator_id.eq.${user.id},assignee_id.eq.${otherUserId}),and(creator_id.eq.${otherUserId},assignee_id.eq.${user.id})`,
    );

  if (reminderError) throw new Error(reminderError.message);

  revalidateConnectionPages();
}
