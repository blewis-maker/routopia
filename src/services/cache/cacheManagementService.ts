export class CacheManagementService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 100; // Maximum number of entries
  private maxAge: number = 1000 * 60 * 60; // 1 hour default TTL

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Ensure cache doesn't exceed size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.maxAge
    });
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldest() {
    const oldestKey = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
    this.cache.delete(oldestKey);
  }

  // Preload frequently used data
  async preloadCache(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        const data = await this.fetchData(key);
        if (data) {
          await this.set(key, data);
        }
      })
    );
  }

  // Clear expired entries
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
} 