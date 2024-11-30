import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error('Missing Upstash Redis credentials');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Create a new ratelimiter that allows 10 requests per 1 minute
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

// Cache responses for 1 hour
export async function cacheResponse(key: string, data: any) {
  await redis.set(key, JSON.stringify(data), { ex: 3600 });
}

export async function getCachedResponse(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached as string) : null;
} 