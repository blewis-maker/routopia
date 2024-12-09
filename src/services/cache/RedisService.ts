import { createClient } from 'redis';
import { RouteContext, RouteSuggestions, EnhancedRoute } from '@/types/chat/types';

export class RedisService {
  private client;
  private readonly TTL = 60 * 60 * 24; // 24 hours in seconds

  constructor() {
    // Create Redis client with Upstash configuration
    this.client = createClient({
      url: `${process.env.UPSTASH_REDIS_URL}?token=${process.env.UPSTASH_REDIS_TOKEN}`,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      // Attempt to reconnect if connection is lost
      if (err.message.includes('ECONNREFUSED')) {
        console.log('Attempting to reconnect to Redis...');
        setTimeout(() => {
          this.client.connect().catch(console.error);
        }, 5000);
      }
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis successfully');
    });

    // Connect immediately
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      await this.client.connect();
      console.log('Redis connection initialized');
    } catch (err) {
      console.error('Failed to initialize Redis connection:', err);
      // Try AWS Redis endpoint as fallback
      try {
        this.client = createClient({
          url: `redis://${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`
        });
        await this.client.connect();
        console.log('Connected to fallback Redis endpoint');
      } catch (fallbackErr) {
        console.error('Failed to connect to fallback Redis:', fallbackErr);
      }
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