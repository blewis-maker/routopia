import { AIService } from '../../services/ai/AIService';
import { POIService } from '../server/src/services/POIService';
import { WeatherService } from '../server/src/services/WeatherService';
import {
  RouteContext,
  MCPResponse,
  RouteSegment,
  ActivityType,
  POIRecommendation,
  GeoPoint,
  WeatherConditions,
  TrafficConditions,
  AIRequest,
  AIResponse
} from '../types/mcp.types';
import logger from '../server/src/utils/logger';

export class MCPService {
  private aiService: AIService;
  private poiService: POIService;
  private weatherService: WeatherService;
  private routeCache: Map<string, MCPResponse>;

  constructor() {
    this.aiService = AIService.getInstance();
    this.poiService = new POIService();
    this.weatherService = new WeatherService();
    this.routeCache = new Map();
  }

  async generateRoute(context: RouteContext): Promise<MCPResponse> {
    try {
      const cacheKey = this.generateCacheKey(context);
      if (this.routeCache.has(cacheKey)) {
        return this.routeCache.get(cacheKey)!;
      }

      // Generate main route segments
      const mainSegments = await this.generateMainRouteSegments(context);

      // Find suitable POIs
      const pois = await this.findRelevantPOIs(context, mainSegments);

      // Get weather and traffic conditions
      const conditions = await this.getRouteConditions(context);

      // Enhance route with AI
      const enhancedRoute = await this.enhanceRouteWithAI({
        route: mainSegments,
        context,
        type: 'ROUTE_ENHANCEMENT'
      });

      const response: MCPResponse = {
        route: enhancedRoute.route || mainSegments,
        suggestedPOIs: pois,
        metadata: {
          totalDistance: this.calculateTotalDistance(mainSegments),
          totalDuration: this.calculateTotalDuration(mainSegments),
          totalElevationGain: this.calculateTotalElevation(mainSegments),
          difficulty: this.calculateDifficulty(mainSegments),
          scenicRating: this.calculateScenicRating(mainSegments),
          mainRouteType: context.preferences.activityType,
          tributaryActivities: this.getUniqueActivities(mainSegments),
          conditions: {
            weather: conditions.weather,
            traffic: conditions.traffic
          },
          timing: this.calculateTiming(mainSegments, context)
        }
      };

      this.routeCache.set(cacheKey, response);
      return response;
    } catch (error) {
      logger.error('Error generating route:', error);
      throw error;
    }
  }

  private async generateMainRouteSegments(context: RouteContext): Promise<RouteSegment[]> {
    // Generate route segments based on activity type
    const segments: RouteSegment[] = [{
      points: [context.startPoint, context.endPoint],
      distance: this.calculateDistance(context.startPoint, context.endPoint),
      duration: this.estimateDuration(context),
      elevationGain: await this.calculateElevationGain(context),
      activityType: context.preferences.activityType,
      segmentType: 'MAIN',
      conditions: {
        weather: await this.weatherService.getWeatherForRoute({
          startPoint: context.startPoint,
          endPoint: context.endPoint,
          preferences: context.preferences
        }),
        surface: this.getDefaultSurface(context.preferences.activityType),
        difficulty: 'moderate',
        safety: 'moderate'
      }
    }];

    return segments;
  }

  private getDefaultSurface(activityType: ActivityType): string[] {
    switch (activityType) {
      case 'WALK':
      case 'RUN':
        return ['pavement', 'trail'];
      case 'BIKE':
        return ['road', 'trail'];
      case 'SKI':
        return ['snow', 'groomed'];
      case 'CAR':
        return ['road'];
      default:
        return ['unknown'];
    }
  }

  private async findRelevantPOIs(
    context: RouteContext,
    segments: RouteSegment[]
  ): Promise<POIRecommendation[]> {
    const searchRadius = this.calculateSearchRadius(segments);
    
    const searchResult = await this.poiService.searchPOIs({
      location: context.startPoint,
      radius: searchRadius,
      activityType: context.preferences.activityType,
      categories: this.getRelevantCategories(context.preferences)
    });

    return searchResult.results;
  }

  private async getRouteConditions(context: RouteContext): Promise<{
    weather: WeatherConditions;
    traffic?: TrafficConditions;
  }> {
    const weather = await this.weatherService.getWeatherForRoute({
      startPoint: context.startPoint,
      endPoint: context.endPoint,
      preferences: context.preferences
    });

    // Implement traffic conditions retrieval
    const traffic: TrafficConditions = {
      congestionLevel: 'low',
      averageSpeed: 65,
      predictedDelays: 0
    };

    return { weather, traffic };
  }

  private async enhanceRouteWithAI(request: AIRequest): Promise<AIResponse> {
    return this.aiService.process(request);
  }

  // Helper methods
  private generateCacheKey(context: RouteContext): string {
    return `${context.startPoint.lat}-${context.startPoint.lng}-${context.endPoint.lat}-${context.endPoint.lng}-${context.preferences.activityType}`;
  }

  private calculateSearchRadius(segments: RouteSegment[]): number {
    const totalDistance = this.calculateTotalDistance(segments);
    return Math.min(totalDistance * 0.1, 5000); // 10% of route distance, max 5km
  }

  private getRelevantCategories(preferences: RouteContext['preferences']): string[] {
    switch (preferences.activityType) {
      case 'WALK':
        return ['park', 'cafe', 'restaurant', 'shopping'];
      case 'BIKE':
        return ['bike_shop', 'park', 'trail_head'];
      case 'RUN':
        return ['park', 'trail_head', 'sports_complex'];
      case 'SKI':
        return ['ski_resort', 'lodge', 'equipment_rental'];
      case 'CAR':
        return ['parking', 'gas_station', 'rest_area'];
      default:
        return [];
    }
  }

  private calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private estimateDuration(context: RouteContext): number {
    const distance = this.calculateDistance(context.startPoint, context.endPoint);
    const speedMap: Record<ActivityType, number> = {
      WALK: 5000,    // 5 km/h
      RUN: 10000,    // 10 km/h
      BIKE: 20000,   // 20 km/h
      CAR: 60000,    // 60 km/h
      SKI: 15000     // 15 km/h
    };
    const speed = speedMap[context.preferences.activityType] || 5000;
    return (distance / speed) * 3600; // Convert to seconds
  }

  private async calculateElevationGain(context: RouteContext): Promise<number> {
    // Implement elevation calculation logic
    return 100; // Placeholder value
  }

  private calculateTotalDistance(segments: RouteSegment[]): number {
    return segments.reduce((total, segment) => total + segment.distance, 0);
  }

  private calculateTotalDuration(segments: RouteSegment[]): number {
    return segments.reduce((total, segment) => total + segment.duration, 0);
  }

  private calculateTotalElevation(segments: RouteSegment[]): number {
    return segments.reduce((total, segment) => total + segment.elevationGain, 0);
  }

  private calculateDifficulty(segments: RouteSegment[]): 'EASY' | 'MODERATE' | 'HARD' {
    const totalDistance = this.calculateTotalDistance(segments);
    const totalElevation = this.calculateTotalElevation(segments);
    
    if (totalElevation > totalDistance * 0.1) return 'HARD';
    if (totalElevation > totalDistance * 0.05) return 'MODERATE';
    return 'EASY';
  }

  private calculateScenicRating(segments: RouteSegment[]): number {
    // Implement scenic rating calculation logic
    return 4;
  }

  private getUniqueActivities(segments: RouteSegment[]): ActivityType[] {
    return Array.from(new Set(segments.map(segment => segment.activityType)));
  }

  private calculateTiming(segments: RouteSegment[], context: RouteContext) {
    return {
      optimalDepartureTime: new Date().toISOString(),
      estimatedArrivalTime: new Date(Date.now() + this.calculateTotalDuration(segments) * 1000).toISOString()
    };
  }
} 