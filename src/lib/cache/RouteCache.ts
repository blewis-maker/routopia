import { redis } from '@/lib/redis';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

export class RouteCache {
  private metrics: PerformanceMetrics;
  private readonly PREFIX = 'route:';
  private readonly TTL = 3600; // 1 hour

  constructor() {
    this.metrics = new PerformanceMetrics();
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    try {
      const data = await redis?.get(this.PREFIX + key);
      const duration = performance.now() - startTime;
      
      this.metrics.record('cache.get', duration, {
        success: !!data,
        key
      });

      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.metrics.record('cache.error', performance.now() - startTime, {
        operation: 'get',
        key,
        error: error.message
      });
      return null;
    }
  }

  async set(key: string, value: any, ttl = this.TTL): Promise<void> {
    const startTime = performance.now();
    try {
      await redis?.setex(this.PREFIX + key, ttl, JSON.stringify(value));
      this.metrics.record('cache.set', performance.now() - startTime, { key });
    } catch (error) {
      this.metrics.record('cache.error', performance.now() - startTime, {
        operation: 'set',
        key,
        error: error.message
      });
    }
  }

  async invalidate(key: string): Promise<void> {
    await redis?.del(this.PREFIX + key);
  }

  getMetrics() {
    return this.metrics.getSummary();
  }
} 