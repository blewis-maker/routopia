import { RealTimeOptimizer } from './RealTimeOptimizer';
import { POIService } from '../poi/POIService';
import { MCPIntegrationService } from '../integration/MCPIntegrationService';
import { 
  RouteSegment, 
  Route, 
  OptimizationResult,
  TerrainConditions 
} from '@/types/route/types';
import { WeatherConditions } from '@/types/weather';
import { GeoPoint } from '@/types/geo';

export class RouteService {
  private cache: Map<string, Route> = new Map();

  constructor(
    private optimizer: RealTimeOptimizer,
    private poiService: POIService,
    private mcpService: MCPIntegrationService
  ) {}

  private validateCoordinates(point: GeoPoint): boolean {
    return point.lat >= -90 && point.lat <= 90 && 
           point.lng >= -180 && point.lng <= 180;
  }

  private validateSegment(segment: RouteSegment): void {
    if (!this.validateCoordinates(segment.startPoint) || 
        !this.validateCoordinates(segment.endPoint)) {
      throw new Error('Invalid coordinates');
    }

    const validActivities = ['WALK', 'RUN', 'BIKE', 'SKI'];
    if (!validActivities.includes(segment.activityType)) {
      throw new Error('Invalid activity type');
    }

    const validOptimizations = [
      'TIME', 'DISTANCE', 'SAFETY', 'TERRAIN', 'SNOW_CONDITIONS',
      'POINTS_OF_INTEREST', 'SCENIC', 'SPEED', 'RECOVERY'
    ];
    if (!validOptimizations.includes(segment.preferences.optimize)) {
      throw new Error('Invalid optimization preference');
    }
  }

  private validateSegmentConnections(segments: RouteSegment[]): void {
    for (let i = 1; i < segments.length; i++) {
      const prevEnd = segments[i - 1].endPoint;
      const currentStart = segments[i].startPoint;
      const distance = this.calculateDistance(prevEnd, currentStart);
      if (distance > 0.001) { // More than ~100m apart
        throw new Error('Disconnected route segments');
      }
    }
  }

  private calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private getCacheKey(segments: RouteSegment[]): string {
    return segments.map(s => 
      `${s.startPoint.lat},${s.startPoint.lng}-${s.endPoint.lat},${s.endPoint.lng}-${s.activityType}-${s.preferences.optimize}`
    ).join('|');
  }

  async createRoute(segments: RouteSegment[]): Promise<Route> {
    if (!segments.length) {
      throw new Error('No route segments provided');
    }

    segments.forEach(this.validateSegment.bind(this));
    this.validateSegmentConnections(segments);

    const cacheKey = this.getCacheKey(segments);
    if (this.cache.has(cacheKey)) {
      const route = this.cache.get(cacheKey)!;
      route.warnings = [...(route.warnings || []), 'using_cached_data'];
      return route;
    }

    const optimizedSegments = await Promise.all(
      segments.map(async segment => {
        try {
          const weather = await this.getWeatherData(segment.startPoint);
          const terrain = await this.getTerrainData(segment.startPoint);
          const result = await this.optimizer.optimizeRoute(
            segment.startPoint,
            segment.endPoint,
            segment.activityType,
            segment.preferences,
            weather,
            terrain
          );
          return this.processOptimizationResult(result, segment);
        } catch (error) {
          console.error('Optimization failed:', error);
          return this.createSimplifiedRoute(segment);
        }
      })
    );

    const route: Route = {
      segments: optimizedSegments.map(result => ({
        path: result.path,
        metrics: result.metrics,
        type: segments[optimizedSegments.indexOf(result)].activityType
      })),
      totalDistance: optimizedSegments.reduce((sum, s) => sum + s.metrics.distance, 0),
      estimatedDuration: optimizedSegments.reduce((sum, s) => sum + s.metrics.duration, 0),
      warnings: []
    };

    this.cache.set(cacheKey, route);
    return route;
  }

  private async getWeatherData(location: GeoPoint): Promise<WeatherConditions | null> {
    try {
      return await this.mcpService.getWeatherForLocation(location);
    } catch (error) {
      console.error('Weather service error:', error);
      return null;
    }
  }

  private async getTerrainData(location: GeoPoint): Promise<TerrainConditions | null> {
    try {
      return await this.mcpService.getTerrainConditions(location);
    } catch (error) {
      console.error('Terrain service error:', error);
      return null;
    }
  }

  private processOptimizationResult(
    result: OptimizationResult,
    segment: RouteSegment
  ): OptimizationResult {
    if (!result.metrics.weatherImpact) {
      result.warnings = [...(result.warnings || []), 'weather_data_unavailable'];
    }
    if (!result.metrics.terrainDifficulty) {
      result.warnings = [...(result.warnings || []), 'terrain_data_unavailable'];
    }
    return result;
  }

  private createSimplifiedRoute(segment: RouteSegment): OptimizationResult {
    return {
      path: [segment.startPoint, segment.endPoint],
      metrics: {
        distance: this.calculateDistance(segment.startPoint, segment.endPoint) * 1000, // Convert to meters
        duration: 0, // Will be estimated based on activity type
        elevation: { gain: 0, loss: 0, profile: [] },
        safety: 0.5,
        weatherImpact: null,
        terrainDifficulty: 'unknown',
        surfaceType: 'mixed'
      },
      warnings: ['using_simplified_routing']
    };
  }

  async invalidateCache(): Promise<void> {
    this.cache.clear();
  }
} 