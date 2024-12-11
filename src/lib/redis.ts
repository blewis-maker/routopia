import { redisService } from '@/services/cache/RedisService';

// Export for backward compatibility
export const redis = redisService.getClient();
export default redis;

// Helper functions
export const cacheKey = (userId: string, type: 'start' | 'dest') => 
  `user:${userId}:recent:${type}`;

export async function getCachedLocations(userId: string, type: 'start' | 'dest') {
  if (typeof window !== 'undefined') return null;
  
  const cached = await redisService.get(cacheKey(userId, type));
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedLocations(
  userId: string, 
  type: 'start' | 'dest', 
  locations: any[]
) {
  if (typeof window !== 'undefined') return;
  
  await redisService.set(
    cacheKey(userId, type),
    JSON.stringify(locations),
    3600
  );
}

// Use feature flags to control Redis usage
export const redisConfig = {
  development: {
    enabled: process.env.REDIS_ENABLED === 'true', // Explicit control
    // ... other config
  }
};

// Graceful fallbacks when Redis isn't available
export class CacheService {
  async get(key: string) {
    if (!this.redisService.isAvailable()) {
      // Fall back to memory cache or return null
      return this.memoryCache.get(key);
    }
    return this.redisService.get(key);
  }
}