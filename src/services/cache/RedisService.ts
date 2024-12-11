import Redis from 'ioredis';
import { RedisConfig, RedisConnectionOptions } from '@/types/redis';
import { getRedisConfig } from '@/config/redis';

// Simple in-memory cache for fallback
class MemoryCache {
  private cache: Map<string, { value: string; expires?: number }>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key: string, value: string, ttl?: number): void {
    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + (ttl * 1000) : undefined
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;
  private memoryCache: MemoryCache;
  private isInitialized = false;
  private isInitializing = false;

  private constructor() {
    this.memoryCache = new MemoryCache();
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  isAvailable(): boolean {
    return this.client !== null && this.isInitialized;
  }

  private getConfig(): RedisConfig | null {
    const config = getRedisConfig();

    // Skip Redis if disabled or in browser
    if (!config.enabled || typeof window !== 'undefined') {
      return null;
    }

    // Skip if no Redis configuration
    if (!config.url && !config.endpoint) {
      return null;
    }

    return {
      url: config.url,
      host: config.endpoint?.split(':')[0],
      port: parseInt(config.endpoint?.split(':')[1] || '6379'),
      password: config.token,
      tls: process.env.NODE_ENV === 'production'
    };
  }

  private createConnectionOptions(config: RedisConfig): RedisConnectionOptions {
    const redisConfig = getRedisConfig();

    return {
      host: config.host,
      port: config.port,
      password: config.password,
      maxRetriesPerRequest: redisConfig.retryAttempts,
      retryStrategy: (times) => {
        if (times > redisConfig.retryAttempts) return null;
        return Math.min(times * redisConfig.retryDelay, 2000);
      },
      enableReadyCheck: false,
      connectTimeout: redisConfig.timeout,
      enableAutoPipelining: true,
      lazyConnect: true,
      tls: config.tls ? { rejectUnauthorized: false } : undefined
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;
    this.isInitializing = true;

    try {
      if (typeof window !== 'undefined') {
        this.isInitialized = true;
        return;
      }

      const config = this.getConfig();
      if (!config) {
        console.log('Redis disabled or not configured, using memory cache');
        this.isInitialized = true;
        return;
      }

      const options = this.createConnectionOptions(config);
      this.client = new Redis(options);

      this.client.on('error', (error: Error & { code?: string }) => {
        if (!['ECONNRESET', 'EPERM'].includes(error.code || '')) {
          console.error('Redis connection error:', error);
        }
      });

      await new Promise<void>((resolve) => {
        if (!this.client) {
          resolve();
          return;
        }

        this.client.once('ready', () => {
          console.log('Redis connected successfully');
          resolve();
        });

        this.client.once('error', () => {
          console.log('Redis connection failed, falling back to memory cache');
          this.client = null;
          resolve();
        });
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Redis initialization error:', error);
      this.client = null;
      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.client) {
        return await this.client.get(key);
      }
      return this.memoryCache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return this.memoryCache.get(key);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (this.client) {
        if (ttl) {
          await this.client.setex(key, ttl, value);
        } else {
          await this.client.set(key, value);
        }
      }
      this.memoryCache.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
      this.memoryCache.set(key, value, ttl);
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}

export const redisService = RedisService.getInstance(); 