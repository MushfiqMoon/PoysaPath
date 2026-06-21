import type { ConnectionProfilePreview } from "@/lib/types";

export function connectionDisplayName(
  profile: ConnectionProfilePreview,
  fallback = "PoysaPath user",
) {
  return profile.display_name?.trim() || fallback;
}
