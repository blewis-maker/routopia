export enum CacheDuration {
  MINUTES_15 = 15 * 60 * 1000,
  HOURS_1 = 60 * 60 * 1000,
  HOURS_4 = 4 * 60 * 60 * 1000,
  HOURS_12 = 12 * 60 * 60 * 1000,
  DAYS_1 = 24 * 60 * 60 * 1000,
  DAYS_7 = 7 * 24 * 60 * 60 * 1000
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class ApiCache {
  private static instance: ApiCache;
  private cache: Map<string, CacheEntry<any>>;

  private constructor() {
    this.cache = new Map();
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), CacheDuration.HOURS_1);
  }

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  set<T>(key: string, data: T, duration: CacheDuration): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Helper methods for specific API responses
  getCachedRoute(start: string, end: string): any {
    return this.get(`route:${start}-${end}`);
  }

  setCachedRoute(start: string, end: string, data: any): void {
    this.set(`route:${start}-${end}`, data, CacheDuration.HOURS_4);
  }

  getCachedPlaceDetails(placeId: string): any {
    return this.get(`place:${placeId}`);
  }

  setCachedPlaceDetails(placeId: string, data: any): void {
    this.set(`place:${placeId}`, data, CacheDuration.DAYS_1);
  }
} 