import { TerrainAnalysisResult } from '@/types/terrain/types';
import { GeoPoint } from '@/types/geo';
import { SatelliteImageData, SatelliteAnalysisResult } from '@/types/terrain/satellite';

interface CacheEntry {
  data: SatelliteImageData;
  analysisResult: SatelliteAnalysisResult;
  timestamp: Date;
  lastAccessed: Date;
  accessCount: number;
  resolution: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface CacheConfig {
  maxEntries: number;
  maxAge: number; // milliseconds
  minResolution: number;
  maxResolution: number;
  preloadRadius: number; // meters
}

export class SatelliteDataCache {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;
  private totalSize: number = 0;
  private maxSize: number = 1024 * 1024 * 1024; // 1GB default
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxEntries: 1000,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      minResolution: 10, // 10 meters per pixel
      maxResolution: 100, // 100 meters per pixel
      preloadRadius: 1000, // 1km
      ...config
    };

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  async get(location: GeoPoint, resolution: number): Promise<SatelliteAnalysisResult | null> {
    const key = this.generateKey(location, resolution);
    const entry = this.cache.get(key);

    if (entry) {
      // Update access statistics
      entry.lastAccessed = new Date();
      entry.accessCount++;
      this.cache.set(key, entry);

      // Check if data is still valid
      if (this.isEntryValid(entry)) {
        return entry.analysisResult;
      }
    }

    return null;
  }

  async set(
    location: GeoPoint,
    resolution: number,
    data: SatelliteImageData,
    analysisResult: SatelliteAnalysisResult
  ): Promise<void> {
    const key = this.generateKey(location, resolution);
    const size = this.calculateSize(data);

    // Check if we need to free up space
    while (this.totalSize + size > this.maxSize) {
      this.evictLeastValuableEntry();
    }

    const entry: CacheEntry = {
      data,
      analysisResult,
      timestamp: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      resolution,
      bounds: this.calculateBounds(location, resolution)
    };

    this.cache.set(key, entry);
    this.totalSize += size;

    // Trigger preloading of adjacent areas
    this.preloadAdjacentAreas(location, resolution);
  }

  async preload(location: GeoPoint, resolution: number): Promise<void> {
    // Implement preloading logic for anticipated areas
    const adjacentPoints = this.getAdjacentPoints(location, this.config.preloadRadius);
    
    for (const point of adjacentPoints) {
      if (!this.hasData(point, resolution)) {
        // Queue for background loading
        this.queueBackgroundLoad(point, resolution);
      }
    }
  }

  private generateKey(location: GeoPoint, resolution: number): string {
    return `${location.latitude.toFixed(6)}_${location.longitude.toFixed(6)}_${resolution}`;
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp.getTime();
    return age < this.config.maxAge;
  }

  private calculateSize(data: SatelliteImageData): number {
    // Implement size calculation based on image data
    return data.width * data.height * 4; // Assuming 32-bit RGBA
  }

  private calculateBounds(location: GeoPoint, resolution: number) {
    const offset = resolution / 111000; // Approximate degrees per meter at equator
    return {
      north: location.latitude + offset,
      south: location.latitude - offset,
      east: location.longitude + offset,
      west: location.longitude - offset
    };
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > this.config.maxAge) {
        this.totalSize -= this.calculateSize(entry.data);
        this.cache.delete(key);
      }
    }
  }

  private evictLeastValuableEntry(): void {
    let leastValuableKey: string | null = null;
    let lowestValue = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Calculate value based on access frequency and recency
      const age = Date.now() - entry.timestamp.getTime();
      const recency = Date.now() - entry.lastAccessed.getTime();
      const value = (entry.accessCount / age) * (1 / recency);

      if (value < lowestValue) {
        lowestValue = value;
        leastValuableKey = key;
      }
    }

    if (leastValuableKey) {
      const entry = this.cache.get(leastValuableKey)!;
      this.totalSize -= this.calculateSize(entry.data);
      this.cache.delete(leastValuableKey);
    }
  }

  private getAdjacentPoints(center: GeoPoint, radius: number): GeoPoint[] {
    const points: GeoPoint[] = [];
    const steps = 8; // Number of points around the circle
    
    for (let i = 0; i < steps; i++) {
      const angle = (2 * Math.PI * i) / steps;
      const lat = center.latitude + (radius / 111000) * Math.cos(angle);
      const lon = center.longitude + (radius / (111000 * Math.cos(center.latitude * Math.PI / 180))) * Math.sin(angle);
      points.push({ latitude: lat, longitude: lon });
    }

    return points;
  }

  private hasData(location: GeoPoint, resolution: number): boolean {
    return this.cache.has(this.generateKey(location, resolution));
  }

  private async queueBackgroundLoad(location: GeoPoint, resolution: number): Promise<void> {
    // Implement background loading queue
    // This would typically integrate with your satellite data fetching service
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
    this.totalSize = 0;
  }
} 