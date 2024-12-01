import { TrafficSegment } from '@/types/maps';

interface TrafficCacheConfig {
  ttl: number;          // Time to live (2 minutes default)
  maxEntries: number;   // Maximum cache entries
  cleanupInterval: number; // Cleanup interval
}

export class TrafficCache {
  private cache: Map<string, {
    data: TrafficSegment[];
    timestamp: number;
    expiresAt: number;
  }>;
  private config: TrafficCacheConfig;

  constructor(config?: Partial<TrafficCacheConfig>) {
    this.cache = new Map();
    this.config = {
      ttl: 2 * 60 * 1000, // 2 minutes
      maxEntries: 50,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    // Start cleanup interval
    setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  generateKey(path: [number, number][]): string {
    return path
      .map(([lat, lng]) => `${lat.toFixed(4)},${lng.toFixed(4)}`)
      .join('|');
  }

  set(key: string, data: TrafficSegment[]): void {
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl
    });
  }

  get(key: string): TrafficSegment[] | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    const oldest = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }
} 