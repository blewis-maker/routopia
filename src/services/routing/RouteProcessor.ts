import { ApiCache, CacheDuration } from '@/lib/cache/ApiCache';
import { RequestOptimizer } from '@/lib/api/RequestOptimizer';
import { Coordinates } from '../maps/MapServiceInterface';

export interface ProcessedRoute {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  alternatives?: Array<{
    coordinates: [number, number][];
    distance: number;
    duration: number;
  }>;
}

export class RouteProcessor {
  private provider: 'mapbox' | 'google';
  private apiKey: string;
  private cache: ApiCache;
  private optimizer: RequestOptimizer;

  constructor(provider: 'mapbox' | 'google', apiKey: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.cache = ApiCache.getInstance();
    this.optimizer = RequestOptimizer.getInstance();
  }

  async calculateRoute(
    start: Coordinates,
    end: Coordinates,
    waypoints?: Coordinates[]
  ): Promise<ProcessedRoute> {
    const cacheKey = this.generateRouteKey(start, end, waypoints);
    const cached = this.cache.get<ProcessedRoute>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const route = await this._fetchRoute(start, end, waypoints);
        this.cache.set(cacheKey, route, CacheDuration.HOURS_4);
        return route;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 300
      }
    );
  }

  private generateRouteKey(
    start: Coordinates,
    end: Coordinates,
    waypoints?: Coordinates[]
  ): string {
    const waypointsString = waypoints
      ? waypoints.map(wp => `${wp.lat.toFixed(4)},${wp.lng.toFixed(4)}`).join('|')
      : '';
    return `route:${start.lat.toFixed(4)},${start.lng.toFixed(4)}|${end.lat.toFixed(4)},${end.lng.toFixed(4)}${waypointsString ? '|' + waypointsString : ''}`;
  }

  private async _fetchRoute(
    start: Coordinates,
    end: Coordinates,
    waypoints?: Coordinates[]
  ): Promise<ProcessedRoute> {
    // ... existing implementation ...
  }

  async getTrafficData(route: ProcessedRoute): Promise<any> {
    const cacheKey = `traffic:${this.generateRouteKey(route.coordinates[0], route.coordinates[route.coordinates.length - 1], route.waypoints)}`;
    const cached = this.cache.get<any>(cacheKey);
    if (cached) return cached;

    return this.optimizer.optimizedRequest(
      cacheKey,
      async () => {
        const trafficData = await this._fetchTrafficData(route);
        this.cache.set(cacheKey, trafficData, CacheDuration.HOURS_4);
        return trafficData;
      },
      {
        maxRetries: 2,
        failoverStrategy: 'cache',
        debounceTime: 300
      }
    );
  }

  private async _fetchTrafficData(route: ProcessedRoute): Promise<any> {
    // ... existing implementation ...
  }
} 