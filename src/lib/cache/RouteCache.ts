import { Route } from '@/types/route/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class RouteCache {
  private cache: Map<string, CacheEntry<Route>>;
  private readonly defaultTTL: number = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  set(key: string, data: Route, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get(key: string): Route | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 1000 * 60 * 5); // Clean up every 5 minutes
  }
} 