interface PersistenceConfig {
  storageKey: string;
  maxStorageSize: number;  // in bytes
  persistInterval: number; // in milliseconds
}

export class CachePersistence {
  private config: PersistenceConfig;
  private caches: {
    route: RouteCache;
    traffic: TrafficCache;
    tile: MapTileCache;
  };

  constructor(
    caches: { route: RouteCache; traffic: TrafficCache; tile: MapTileCache },
    config?: Partial<PersistenceConfig>
  ) {
    this.caches = caches;
    this.config = {
      storageKey: 'routopia_cache',
      maxStorageSize: 50 * 1024 * 1024, // 50MB
      persistInterval: 5 * 60 * 1000,    // 5 minutes
      ...config
    };

    this.initializeFromStorage();
    this.startPersistence();
  }

  private async initializeFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore each cache type
        if (data.route) this.restoreCache('route', data.route);
        if (data.traffic) this.restoreCache('traffic', data.traffic);
        if (data.tile) this.restoreCache('tile', data.tile);
      }
    } catch (error) {
      console.error('Failed to restore cache from storage:', error);
    }
  }

  private startPersistence(): void {
    setInterval(() => this.persistToStorage(), this.config.persistInterval);
  }

  private async persistToStorage(): Promise<void> {
    try {
      const cacheData = {
        route: await this.serializeCache('route'),
        traffic: await this.serializeCache('traffic'),
        tile: await this.serializeCache('tile'),
        timestamp: Date.now()
      };

      localStorage.setItem(this.config.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to persist cache to storage:', error);
    }
  }

  private async serializeCache(type: keyof typeof this.caches): Promise<any> {
    // Implement cache-specific serialization
    return this.caches[type].serialize?.() || null;
  }

  private async restoreCache(type: keyof typeof this.caches, data: any): Promise<void> {
    // Implement cache-specific restoration
    await this.caches[type].restore?.(data);
  }
} 