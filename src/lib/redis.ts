import { Redis } from 'ioredis';

const getRedisClient = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
  });

  redis.on('error', (err) => console.error('Redis Client Error', err));
  redis.on('connect', () => console.log('Redis Client Connected'));

  return redis;
};

export const redis = getRedisClient();

export const cacheKey = (userId: string, type: 'start' | 'dest') => 
  `user:${userId}:recent:${type}`;

export async function getCachedLocations(userId: string, type: 'start' | 'dest') {
  const key = cacheKey(userId, type);
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedLocations(
  userId: string, 
  type: 'start' | 'dest', 
  locations: any[]
) {
  const key = cacheKey(userId, type);
  await redis.setex(key, 3600, JSON.stringify(locations)); // Cache for 1 hour
} 