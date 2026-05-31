/** Prevent open redirects — only same-origin relative paths are allowed. */
export function getSafeNextPath(next: string | null | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export function buildOAuthRedirectUrl(
  origin: string,
  next?: string | null,
): string {
  const url = new URL("/auth/callback", origin);
  const safeNext = getSafeNextPath(next);
  if (safeNext !== "/dashboard") {
    url.searchParams.set("next", safeNext);
  }
  return url.toString();
}
