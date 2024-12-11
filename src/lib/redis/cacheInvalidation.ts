import { redis } from './index';

export interface InvalidationStrategy {
  pattern: string;
  ttl?: number;
  dependencies?: string[];
}

export class CacheInvalidator {
  private strategies: Map<string, InvalidationStrategy> = new Map();

  register(key: string, strategy: InvalidationStrategy): void {
    this.strategies.set(key, strategy);
  }

  async invalidate(key: string): Promise<void> {
    const strategy = this.strategies.get(key);
    if (!strategy) {
      await redis.del(key);
      return;
    }

    // Invalidate pattern matches
    const keys = await redis.keys(strategy.pattern);
    if (keys.length) {
      await Promise.all(keys.map(k => redis.del(k)));
    }

    // Invalidate dependencies
    if (strategy.dependencies?.length) {
      await Promise.all(
        strategy.dependencies.map(dep => this.invalidate(dep))
      );
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await Promise.all(keys.map(k => redis.del(k)));
    }
  }

  async invalidateAll(): Promise<void> {
    const keys = await redis.keys('*');
    if (keys.length) {
      await Promise.all(keys.map(k => redis.del(k)));
    }
  }
}

export const cacheInvalidator = new CacheInvalidator(); 