import { cache } from "react";

import { extractOAuthProfile } from "@/lib/auth/oauth-profile";
import { createClient } from "@/lib/supabase/server";

/** Deduped per request — avoids repeated Supabase auth calls on the same page. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export type UserProfile = {
  displayName: string;
  avatarUrl: string | null;
};

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const oauth = extractOAuthProfile(user.user_metadata);

  const displayName =
    profile?.display_name?.trim() ||
    oauth.displayName ||
    user.email?.split("@")[0] ||
    "there";

  const avatarUrl = profile?.avatar_url?.trim() || oauth.avatarUrl;

  return { displayName, avatarUrl };
});

export const getDisplayName = cache(async () => {
  const profile = await getUserProfile();
  return profile?.displayName ?? "there";
});
