/** Canonical site origin for sitemap, robots, and metadata. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
