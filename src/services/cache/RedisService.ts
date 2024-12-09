import { createClient } from 'redis';
import { RouteContext, RouteSuggestions, EnhancedRoute } from '@/types/chat/types';

export class RedisService {
  private client;
  private readonly TTL = 60 * 60 * 24; // 24 hours in seconds

  constructor() {
    // Format Redis URL based on environment
    const redisUrl = this.getRedisUrl();
    console.log('Initializing Redis with URL:', this.maskSensitiveInfo(redisUrl));

    this.client = createClient({
      url: redisUrl,
      socket: {
        tls: true, // Enable TLS for Upstash
        rejectUnauthorized: false, // Required for some Redis services
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max reconnection attempts reached');
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis successfully');
    });

    // Connect immediately
    this.connect();
  }

  private getRedisUrl(): string {
    // Use Upstash Redis URL with correct format
    if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
      // Format: redis://default:token@hostname:port
      const url = new URL(process.env.UPSTASH_REDIS_URL);
      return `redis://default:${process.env.UPSTASH_REDIS_TOKEN}@${url.hostname}:${url.port || 6379}`;
    }

    // Fallback to local Redis
    return 'redis://localhost:6379';
  }

  private maskSensitiveInfo(url: string): string {
    return url.replace(/default:([^@]+)@/, 'default:***@');
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  private generateKey(prefix: string, context: RouteContext): string {
    // Include more context in the key for better caching
    const weatherKey = context.weather ? 
      `${context.weather.temperature}-${context.weather.conditions}` : 'no-weather';
    
    const key = `${prefix}:${context.start}:${context.end}:${context.mode}:${weatherKey}:${context.timeOfDay}`;
    return key.toLowerCase().replace(/\s+/g, '-').slice(0, 512); // Redis key length limit
  }

  async getCachedRoute(context: RouteContext): Promise<EnhancedRoute | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const key = this.generateKey('route', context);
      const cached = await this.client.get(key);
      if (cached) {
        console.log('Cache hit for route:', key);
        return JSON.parse(cached);
      }
      console.log('Cache miss for route:', key);
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async setCachedRoute(context: RouteContext, data: EnhancedRoute): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const key = this.generateKey('route', context);
      await this.client.setEx(key, this.TTL, JSON.stringify(data));
      console.log('Cached route:', key);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async getCachedSuggestions(context: RouteContext): Promise<RouteSuggestions | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const key = this.generateKey('suggestions', context);
      const cached = await this.client.get(key);
      if (cached) {
        console.log('Cache hit for suggestions:', key);
        return JSON.parse(cached);
      }
      console.log('Cache miss for suggestions:', key);
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async setCachedSuggestions(context: RouteContext, data: RouteSuggestions): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const key = this.generateKey('suggestions', context);
      await this.client.setEx(key, this.TTL, JSON.stringify(data));
      console.log('Cached suggestions:', key);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async invalidateCache(context: RouteContext): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const routeKey = this.generateKey('route', context);
      const suggestionsKey = this.generateKey('suggestions', context);
      await Promise.all([
        this.client.del(routeKey),
        this.client.del(suggestionsKey)
      ]);
      console.log('Invalidated cache for:', routeKey, suggestionsKey);
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }
} 