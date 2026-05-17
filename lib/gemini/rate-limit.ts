const HOURLY_LIMIT = 40;
const windowMs = 60 * 60 * 1000;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkGeminiRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = buckets.get(userId);

  if (!entry || now >= entry.resetAt) {
    buckets.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= HOURLY_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}
