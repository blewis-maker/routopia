interface CacheMetrics {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

export class CacheAnalytics {
  private metrics: Map<string, CacheMetrics>;
  private readonly METRICS_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.metrics = new Map();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    ['route', 'traffic', 'tile'].forEach(cacheType => {
      this.metrics.set(cacheType, {
        hits: 0,
        misses: 0,
        size: 0,
        evictions: 0
      });
    });
  }

  recordHit(cacheType: string): void {
    const metrics = this.metrics.get(cacheType);
    if (metrics) {
      metrics.hits++;
    }
  }

  recordMiss(cacheType: string): void {
    const metrics = this.metrics.get(cacheType);
    if (metrics) {
      metrics.misses++;
    }
  }

  recordEviction(cacheType: string): void {
    const metrics = this.metrics.get(cacheType);
    if (metrics) {
      metrics.evictions++;
    }
  }

  updateSize(cacheType: string, size: number): void {
    const metrics = this.metrics.get(cacheType);
    if (metrics) {
      metrics.size = size;
    }
  }

  getMetrics(cacheType: string): CacheMetrics | null {
    return this.metrics.get(cacheType) || null;
  }

  getHitRate(cacheType: string): number {
    const metrics = this.metrics.get(cacheType);
    if (!metrics) return 0;
    const total = metrics.hits + metrics.misses;
    return total === 0 ? 0 : metrics.hits / total;
  }

  reset(cacheType: string): void {
    this.metrics.set(cacheType, {
      hits: 0,
      misses: 0,
      size: 0,
      evictions: 0
    });
  }
} 