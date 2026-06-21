import { createClient } from "@/lib/supabase/server";
import type {
  ConnectedContact,
  ConnectionProfilePreview,
  ConnectionRequest,
} from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ConnectionRow = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
};

async function fetchProfilesByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, ConnectionProfilePreview>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);

  if (error) throw new Error(error.message);

  return new Map(
    (data ?? []).map((p) => [
      p.id,
      {
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
      },
    ]),
  );
}

function profileOrFallback(id: string, map: Map<string, ConnectionProfilePreview>) {
  return (
    map.get(id) ?? {
      id,
      display_name: null,
      avatar_url: null,
    }
  );
}

function mapRequest(
  row: ConnectionRow,
  userId: string,
  profiles: Map<string, ConnectionProfilePreview>,
): ConnectionRequest {
  const otherId = row.requester_id === userId ? row.recipient_id : row.requester_id;
  return {
    id: row.id,
    requester_id: row.requester_id,
    recipient_id: row.recipient_id,
    status: row.status as ConnectionRequest["status"],
    created_at: row.created_at,
    responded_at: row.responded_at,
    other_user: profileOrFallback(otherId, profiles),
  };
}

export async function areUsersConnected(
  supabase: SupabaseClient,
  userA: string,
  userB: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("are_users_connected", {
    user_a: userA,
    user_b: userB,
  });

  if (error) {
    if (error.code === "42883") return false;
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function getPendingIncomingRequests(): Promise<ConnectionRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("connection_requests")
    .select("id, requester_id, recipient_id, status, created_at, responded_at")
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ConnectionRow[];
  const otherIds = rows.map((r) => r.requester_id);
  const profiles = await fetchProfilesByIds(supabase, otherIds);

  return rows.map((row) => mapRequest(row, user.id, profiles));
}

export async function getPendingOutgoingRequests(): Promise<ConnectionRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("connection_requests")
    .select("id, requester_id, recipient_id, status, created_at, responded_at")
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ConnectionRow[];
  const otherIds = rows.map((r) => r.recipient_id);
  const profiles = await fetchProfilesByIds(supabase, otherIds);

  return rows.map((row) => mapRequest(row, user.id, profiles));
}

export async function getConnectedContacts(): Promise<ConnectedContact[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("connection_requests")
    .select("id, requester_id, recipient_id, created_at, responded_at")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("responded_at", { ascending: false, nullsFirst: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ConnectionRow[];
  const otherIds = rows.map((r) =>
    r.requester_id === user.id ? r.recipient_id : r.requester_id,
  );
  const profiles = await fetchProfilesByIds(supabase, otherIds);

  return rows.map((row) => {
    const otherId =
      row.requester_id === user.id ? row.recipient_id : row.requester_id;
    return {
      connection_id: row.id,
      user: profileOrFallback(otherId, profiles),
      connected_at: row.responded_at ?? row.created_at,
    };
  });
}

export async function lookupProfileIdByEmail(email: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_profile_id_by_email", {
    normalized_email: email,
  });

  if (error) {
    if (error.message.includes("cannot connect with yourself")) {
      throw new Error("You cannot connect with yourself.");
    }
    if (error.code === "42883") {
      throw new Error("Run migration 024_connections_shared_reminders.sql in Supabase.");
    }
    throw new Error(error.message);
  }

  return data as string | null;
}

export async function searchConnectionCandidateByEmail(
  email: string,
): Promise<ConnectionProfilePreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_connection_candidate_by_email", {
    normalized_email: email,
  });

  if (error) {
    if (error.message.includes("cannot connect with yourself")) {
      throw new Error("You cannot connect with yourself.");
    }
    if (error.code === "42883") {
      throw new Error(
        "Run migration 025_connection_search_by_email.sql in Supabase.",
      );
    }
    throw new Error(error.message);
  }

  if (!data || typeof data !== "object") return null;

  const row = data as {
    id?: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };

  if (!row.id) return null;

  return {
    id: row.id,
    display_name: row.display_name ?? null,
    avatar_url: row.avatar_url ?? null,
  };
}
