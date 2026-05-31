import type { User } from "@supabase/supabase-js";

import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type OAuthProfileFields = {
  displayName: string | null;
  avatarUrl: string | null;
};

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/** Read display name and avatar URL from Supabase user metadata (Google OAuth). */
export function extractOAuthProfile(
  metadata: Record<string, unknown> | undefined,
): OAuthProfileFields {
  return {
    displayName:
      readMetadataString(metadata, "full_name") ??
      readMetadataString(metadata, "name"),
    avatarUrl:
      readMetadataString(metadata, "avatar_url") ??
      readMetadataString(metadata, "picture"),
  };
}

/**
 * Fill missing profile fields from OAuth metadata.
 * Display name is only set when empty; avatar refreshes from Google on sign-in.
 */
export async function syncProfileFromAuthUser(
  supabase: SupabaseServerClient,
  user: User,
) {
  const { displayName, avatarUrl } = extractOAuthProfile(user.user_metadata);
  if (!displayName && !avatarUrl) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const updates: {
    display_name?: string;
    avatar_url?: string;
  } = {};

  if (displayName && !profile?.display_name?.trim()) {
    updates.display_name = displayName;
  }
  if (avatarUrl) {
    updates.avatar_url = avatarUrl;
  }

  if (Object.keys(updates).length === 0) return;

  await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}
