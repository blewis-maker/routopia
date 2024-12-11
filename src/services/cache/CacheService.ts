import { RedisService } from './RedisService';

export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get(key: string) {
    if (typeof window !== 'undefined') return null;
    return this.redisService.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (typeof window !== 'undefined') return;
    await this.redisService.set(key, value, ttl);
  }
} 