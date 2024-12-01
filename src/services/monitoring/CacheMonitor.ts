import { CacheAnalytics } from '@/services/cache/CacheAnalytics';

export class CacheMonitor {
  private analytics: CacheAnalytics;
  private readonly ALERT_THRESHOLD = 0.6; // Alert if hit rate drops below 60%
  private readonly LOG_INTERVAL = 5 * 60 * 1000; // Log every 5 minutes

  constructor(analytics: CacheAnalytics) {
    this.analytics = analytics;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => this.checkMetrics(), this.LOG_INTERVAL);
  }

  private checkMetrics(): void {
    ['route', 'traffic', 'tile'].forEach(cacheType => {
      const metrics = this.analytics.getMetrics(cacheType);
      const hitRate = this.analytics.getHitRate(cacheType);

      // Log metrics
      console.info(`Cache metrics for ${cacheType}:`, {
        hitRate: `${(hitRate * 100).toFixed(1)}%`,
        hits: metrics?.hits,
        misses: metrics?.misses,
        size: `${(metrics?.size || 0 / 1024 / 1024).toFixed(2)}MB`,
        evictions: metrics?.evictions
      });

      // Alert on low hit rate
      if (hitRate < this.ALERT_THRESHOLD) {
        console.warn(`Low cache hit rate for ${cacheType}: ${(hitRate * 100).toFixed(1)}%`);
      }
    });
  }
} 