import { Redis } from '@upstash/redis';
import { Metrics } from '@/lib/metrics';

export class CacheMonitor {
  private redis: Redis;
  private metrics: Metrics;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!
    });
    this.metrics = new Metrics('cache');
  }

  async getStats() {
    const info = await this.redis.info();
    const metrics = await this.metrics.getLatest();

    return {
      hits: metrics.hits || 0,
      misses: metrics.misses || 0,
      latency: metrics.latency?.avg || 0,
      errorRate: metrics.errors / (metrics.hits + metrics.misses) || 0,
      size: info.used_memory || 0
    };
  }
} 