/** Prevent open redirects — only same-origin relative paths are allowed. */
export function getSafeNextPath(next: string | null | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

/** Prefer NEXT_PUBLIC_APP_URL so OAuth always returns to the canonical production host. */
export function getOAuthOrigin(fallbackOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return configured || fallbackOrigin;
}

export function buildOAuthRedirectUrl(
  origin: string,
  next?: string | null,
): string {
  const url = new URL("/auth/callback", getOAuthOrigin(origin));
  const safeNext = getSafeNextPath(next);
  if (safeNext !== "/dashboard") {
    url.searchParams.set("next", safeNext);
  }
  return url.toString();
}
