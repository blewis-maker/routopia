interface TileCacheConfig {
  maxSize: number;      // Maximum cache size in MB
  ttl: number;          // Time to live in milliseconds
  cleanupInterval: number;
}

export class MapTileCache {
  private cache: Map<string, {
    data: ArrayBuffer;
    size: number;
    timestamp: number;
    expiresAt: number;
  }>;
  private config: TileCacheConfig;
  private currentSize: number = 0;

  constructor(config?: Partial<TileCacheConfig>) {
    this.cache = new Map();
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 24 * 60 * 60 * 1000,  // 24 hours
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config
    };

    setInterval(() => this.cleanup(), this.config.cleanupInterval);
  }

  generateKey(z: number, x: number, y: number): string {
    return `${z}/${x}/${y}`;
  }

  async set(key: string, data: ArrayBuffer): Promise<void> {
    const size = data.byteLength;

    // Check if adding this tile would exceed max size
    if (this.currentSize + size > this.config.maxSize) {
      await this.evictOldest(size);
    }

    this.cache.set(key, {
      data,
      size,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.ttl
    });

    this.currentSize += size;
  }

  get(key: string): ArrayBuffer | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) {
        this.currentSize -= entry.size;
        this.cache.delete(key);
      }
      return null;
    }
    return entry.data;
  }

  private async evictOldest(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      freedSpace += entry.size;
      this.currentSize -= entry.size;

      if (freedSpace >= requiredSize) break;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.currentSize -= entry.size;
        this.cache.delete(key);
      }
    }
  }
} 