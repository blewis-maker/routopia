import { ServiceInterface, CacheableService } from '../interfaces/ServiceInterface';
import { LatLng } from '@/types/shared';
import { MapBounds, TrafficData, TrafficFlow } from '@/types/traffic';
import { redis } from '@/lib/redis';
import { GoogleMapsManager } from '../maps/GoogleMapsManager';

export class TrafficService implements ServiceInterface, CacheableService {
  private initialized = false;
  private readonly CACHE_TTL = 300; // 5 minutes
  private mapsManager: GoogleMapsManager;

  constructor(mapsManager: GoogleMapsManager) {
    this.mapsManager = mapsManager;
  }

  async initialize(): Promise<void> {
    if (!this.mapsManager.isInitialized()) {
      throw new Error('Maps service must be initialized first');
    }
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async healthCheck(): Promise<boolean> {
    return this.mapsManager.isInitialized();
  }

  async getCurrentTraffic(bounds: MapBounds): Promise<TrafficData> {
    const cacheKey = this.getCacheKey({ type: 'current', bounds });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const trafficData = await this.mapsManager.getTrafficData(bounds);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(trafficData));
    
    return trafficData;
  }

  async getTrafficFlow(location: LatLng, radius: number): Promise<TrafficFlow> {
    const cacheKey = this.getCacheKey({ type: 'flow', location, radius });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const flow = await this.mapsManager.getTrafficFlow(location, radius);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(flow));
    
    return flow;
  }

  async getAlternativeRoutes(start: LatLng, end: LatLng, options?: {
    departureTime?: Date;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  }): Promise<Array<{
    route: LatLng[];
    duration: number;
    distance: number;
    trafficDensity: number;
  }>> {
    const cacheKey = this.getCacheKey({ 
      type: 'alternatives', 
      start, 
      end, 
      options 
    });
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const alternatives = await this.mapsManager.getAlternativeRoutes(
      start, 
      end, 
      options
    );
    
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(alternatives));
    return alternatives;
  }

  // CacheableService implementation
  getCacheKey(params: any): string {
    const { type } = params;
    switch (type) {
      case 'current':
        const { bounds } = params;
        return `traffic:current:${bounds.north},${bounds.south},${bounds.east},${bounds.west}`;
      case 'flow':
        const { location, radius } = params;
        return `traffic:flow:${location.lat},${location.lng}:${radius}`;
      case 'alternatives':
        const { start, end, options } = params;
        return `traffic:alt:${start.lat},${start.lng}:${end.lat},${end.lng}:${JSON.stringify(options)}`;
      default:
        throw new Error(`Invalid traffic cache key type: ${type}`);
    }
  }

  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  async clearCache(): Promise<void> {
    const keys = await redis.keys('traffic:*');
    if (keys.length) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  }
} 