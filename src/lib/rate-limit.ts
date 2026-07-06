// Lightweight sliding-window rate limiter for server actions.
// In-memory per serverless instance — good enough to blunt brute force and abuse
// on a human-scale platform; upgrade to a durable store (Upstash/pg) if traffic demands.
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart)
  if (hits.length >= max) {
    const retryAfterSec = Math.ceil((hits[0] + windowMs - now) / 1000)
    buckets.set(key, hits)
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) }
  }
  hits.push(now)
  buckets.set(key, hits)
  // opportunistic cleanup so the map can't grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => t <= windowStart)) buckets.delete(k)
    }
  }
  return { allowed: true, retryAfterSec: 0 }
}

export const RATE_LIMIT_MSG = 'محاولات كثيرة — انتظري قليلًا ثم حاولي مجددًا.'
