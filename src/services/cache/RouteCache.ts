import { RouteVisualizationData, ActivityType } from '@/types/maps';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RouteCacheConfig {
  routeTTL: number;      // Time to live for route data (e.g., 1 hour)
  trafficTTL: number;    // Time to live for traffic data (e.g., 2 minutes)
  maxEntries: number;    // Maximum number of entries to store
}

export class RouteCache {
  private cache: Map<string, CacheEntry<RouteVisualizationData>>;
  private config: RouteCacheConfig;

  constructor(config?: Partial<RouteCacheConfig>) {
    this.cache = new Map();
    this.config = {
      routeTTL: 60 * 60 * 1000,  // 1 hour
      trafficTTL: 2 * 60 * 1000, // 2 minutes
      maxEntries: 100,
      ...config
    };
  }

  generateKey(start: Coordinates, end: Coordinates, activityType: ActivityType): string {
    return `${start.lat},${start.lng}-${end.lat},${end.lng}-${activityType}`;
  }

  set(key: string, data: RouteVisualizationData): void {
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.routeTTL
    });
  }

  get(key: string): RouteVisualizationData | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  evictOldest(): void {
    const oldestEntry = this.cache.values().next().value;
    this.cache.delete(oldestEntry.key);
  }
} 