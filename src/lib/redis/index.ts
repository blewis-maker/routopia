import { Redis } from '@upstash/redis';
import { RedisConnectionError, RedisCacheError } from '@/lib/utils/errors/redisErrors';
import { RetryStrategy, exponentialRetry } from './retryStrategies';
import { cacheInvalidator } from './cacheInvalidation';

class RedisWrapper {
  private client: Redis;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new RedisConnectionError('Redis URL not configured');
    }

    this.client = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN
    });
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    key: string,
    operationName: string,
    strategy: RetryStrategy = exponentialRetry
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (
          attempt < strategy.maxRetries && 
          strategy.shouldRetry(lastError, attempt)
        ) {
          const delay = strategy.getDelay(attempt, strategy.baseDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new RedisCacheError(operationName, key, lastError);
      }
    }

    throw new RedisCacheError(operationName, key, lastError!);
  }

  async get(key: string): Promise<string | null> {
    return this.withRetry(
      () => this.client.get(key),
      key,
      'get'
    );
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.withRetry(
      () => ttl ? this.client.setex(key, ttl, value) : this.client.set(key, value),
      key,
      'set'
    );
  }

  async del(key: string): Promise<void> {
    await this.withRetry(
      () => this.client.del(key),
      key,
      'delete'
    );
  }

  async keys(pattern: string): Promise<string[]> {
    return this.withRetry(
      () => this.client.keys(pattern),
      pattern,
      'keys'
    );
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return this.withRetry(
      () => this.client.mget(...keys),
      keys.join(','),
      'mget'
    );
  }

  async pipeline(): Promise<Pipeline> {
    return new Pipeline(this.client.pipeline());
  }

  async invalidate(key: string): Promise<void> {
    await cacheInvalidator.invalidate(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    await cacheInvalidator.invalidateByPattern(pattern);
  }

  async clearAll(): Promise<void> {
    await cacheInvalidator.invalidateAll();
  }
}

class Pipeline {
  constructor(private pipeline: any) {}

  set(key: string, value: string, options?: { ex?: number }): Pipeline {
    if (options?.ex) {
      this.pipeline.setex(key, options.ex, value);
    } else {
      this.pipeline.set(key, value);
    }
    return this;
  }

  del(key: string): Pipeline {
    this.pipeline.del(key);
    return this;
  }

  async exec(): Promise<Array<'OK' | null>> {
    return this.pipeline.exec();
  }
}

export const redis = new RedisWrapper(); 