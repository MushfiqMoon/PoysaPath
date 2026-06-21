import { createClient } from "@/lib/supabase/server";
import type { ConnectionProfilePreview, SharedReminder } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SharedReminderRow = {
  id: string;
  creator_id: string;
  assignee_id: string;
  title: string;
  note: string | null;
  due_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: string | null;
};

async function fetchProfilesByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, ConnectionProfilePreview>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", unique);

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

function mapReminder(
  row: SharedReminderRow,
  profiles: Map<string, ConnectionProfilePreview>,
): SharedReminder {
  return {
    id: row.id,
    creator_id: row.creator_id,
    assignee_id: row.assignee_id,
    title: row.title,
    note: row.note,
    due_at: row.due_at,
    status: row.status as SharedReminder["status"],
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
    completed_by: row.completed_by,
    creator: profileOrFallback(row.creator_id, profiles),
    assignee: profileOrFallback(row.assignee_id, profiles),
  };
}

export async function getOpenSharedReminders(): Promise<SharedReminder[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("shared_reminders")
    .select(
      "id, creator_id, assignee_id, title, note, due_at, status, created_at, updated_at, completed_at, completed_by",
    )
    .eq("status", "open")
    .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SharedReminderRow[];
  const profileIds = rows.flatMap((r) => [r.creator_id, r.assignee_id]);
  const profiles = await fetchProfilesByIds(supabase, profileIds);

  return rows.map((row) => mapReminder(row, profiles));
}
