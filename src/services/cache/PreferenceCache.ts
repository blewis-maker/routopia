import { redis } from '@/lib/redis';

export class PreferenceCache {
  private readonly prefix = 'prefs:';
  private readonly ttl = 3600; // 1 hour

  async get(userId: string): Promise<string | null> {
    return redis.get(this.getKey(userId));
  }

  async set(userId: string, preferences: string): Promise<void> {
    await redis.setEx(this.getKey(userId), this.ttl, preferences);
  }

  async delete(userId: string): Promise<void> {
    await redis.del(this.getKey(userId));
  }

  async clear(): Promise<void> {
    const keys = await redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  private getKey(userId: string): string {
    return `${this.prefix}${userId}`;
  }
} 