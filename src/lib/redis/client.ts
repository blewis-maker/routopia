import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  throw new Error('Missing Upstash Redis credentials');
}

// Ensure URL starts with https://
const url = process.env.UPSTASH_REDIS_URL.startsWith('https://')
  ? process.env.UPSTASH_REDIS_URL
  : `https://${process.env.UPSTASH_REDIS_URL}`;

const redis = new Redis({
  url: url,
  token: process.env.UPSTASH_REDIS_TOKEN
});

export { redis }; 