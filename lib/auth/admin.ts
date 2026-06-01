import { cache } from "react";

import { getAuthUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalUsers: number;
  usersLoggedIn: number;
};

export type AdminUserRow = {
  email: string;
  lastSeenAt: string | null;
};

export const getIsSuperAdmin = cache(async (): Promise<boolean> => {
  const user = await getAuthUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return false;
  return data?.is_super_admin === true;
});

export async function touchLastSeen(): Promise<void> {
  const user = await getAuthUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.rpc("touch_last_seen");
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_stats");

  if (error) {
    throw new Error(error.message);
  }

  const row = data as {
    total_users: number;
    users_logged_in: number;
  };

  return {
    totalUsers: row.total_users ?? 0,
    usersLoggedIn: row.users_logged_in ?? 0,
  };
}

export async function getAdminUserList(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_user_list");

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const item = row as { email: string; last_seen_at: string | null };
    return {
      email: item.email,
      lastSeenAt: item.last_seen_at ?? null,
    };
  });
}
