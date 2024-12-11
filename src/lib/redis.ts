import { Redis, RedisOptions } from 'ioredis';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

interface RedisMetrics {
  hits: number;
  misses: number;
  errors: number;
  latency: number[];
}

class RedisManager {
  private static instance: RedisManager;
  private redis: Redis | null = null;
  private metrics: PerformanceMetrics;
  private stats: RedisMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    latency: []
  };

  private constructor() {
    this.metrics = new PerformanceMetrics();
  }

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async initialize() {
    if (this.redis) return this.redis;

    try {
      const options: RedisOptions = {
        host: process.env.REDIS_ENDPOINT,
        port: parseInt(process.env.REDIS_PORT!, 10),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        // Use proper Redis connection string format
        username: process.env.UPSTASH_REDIS_USERNAME,
        password: process.env.UPSTASH_REDIS_TOKEN,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined
      };

      // If using Upstash URL, use it directly
      if (process.env.UPSTASH_REDIS_URL) {
        this.redis = new Redis(process.env.UPSTASH_REDIS_URL);
      } else {
        this.redis = new Redis(options);
      }

      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.stats.errors++;
        this.metrics.record('redis.error', 1);
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.metrics.record('redis.connect', 1);
      });

      return this.redis;
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    try {
      if (!this.redis) {
        if (process.env.NODE_ENV === 'development') {
          return this.getFallback<T>(key);
        }
        return null;
      }

      const data = await this.redis.get(key);
      const duration = performance.now() - startTime;
      
      this.stats.latency.push(duration);
      if (this.stats.latency.length > 100) this.stats.latency.shift();

      if (data) {
        this.stats.hits++;
        this.metrics.record('redis.hit', duration);
        return JSON.parse(data);
      } else {
        this.stats.misses++;
        this.metrics.record('redis.miss', duration);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      this.metrics.record('redis.error', performance.now() - startTime);
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    const startTime = performance.now();
    try {
      if (!this.redis) {
        if (process.env.NODE_ENV === 'development') {
          return this.setFallback(key, value, ttl);
        }
        return;
      }

      await this.redis.setex(key, ttl, JSON.stringify(value));
      this.metrics.record('redis.set', performance.now() - startTime);
    } catch (error) {
      this.stats.errors++;
      this.metrics.record('redis.error', performance.now() - startTime);
      console.error('Redis set error:', error);
    }
  }

  getMetrics() {
    const avgLatency = this.stats.latency.reduce((a, b) => a + b, 0) / this.stats.latency.length;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      errors: this.stats.errors,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
      avgLatency,
      ...this.metrics.getSummary()
    };
  }

  // Development fallback using Map
  private memoryCache = new Map<string, { value: any; expires: number }>();

  private getFallback<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  private setFallback(key: string, value: any, ttl: number): void {
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000
    });
  }
}

export const redisManager = RedisManager.getInstance();

// Helper functions for route caching
export const routeCacheKey = (routeId: string) => `route:${routeId}`;
export const chatCacheKey = (routeId: string) => `chat:${routeId}`;

export async function getCachedRoute(routeId: string) {
  if (!process.env.REDIS_ENABLED) return null;
  const cached = await redisManager.get(routeCacheKey(routeId));
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedRoute(routeId: string, data: any) {
  if (!process.env.REDIS_ENABLED) return;
  await redisManager.set(
    routeCacheKey(routeId),
    JSON.stringify(data),
    parseInt(process.env.REDIS_TTL!, 10)
  );
}