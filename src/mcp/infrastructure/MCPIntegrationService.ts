import { AIService } from '../../services/ai/AIService';
import { ActivityOptimizer } from '../../services/ActivityOptimizer';
import { DynamicExperienceOptimizer } from '../../services/DynamicExperienceOptimizer';
import { MCPService } from './MCPService';
import { POIService } from '../server/src/services/POIService';
import { RouteService } from '../server/src/services/RouteService';
import { ActivityService } from '../server/src/services/ActivityService';
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
  TributaryRoute
} from '../types/mcp.types';
import logger from '../server/src/utils/logger';

export class MCPIntegrationService {
  private aiService: AIService;
  private activityOptimizer: ActivityOptimizer;
  private experienceOptimizer: DynamicExperienceOptimizer;
  private mcpService: MCPService;
  private poiService: POIService;
  private routeService: RouteService;
  private activityService: ActivityService;
  private weatherService: WeatherService;
  private poiCache: Map<string, POIRecommendation[]>;

  constructor() {
    this.aiService = AIService.getInstance();
    this.activityOptimizer = new ActivityOptimizer();
    this.experienceOptimizer = new DynamicExperienceOptimizer();
    this.mcpService = new MCPService();
    this.poiService = new POIService();
    this.routeService = new RouteService(this.poiService);
    this.activityService = new ActivityService(this.weatherService, this.poiService);
    this.weatherService = new WeatherService();
    this.poiCache = new Map();
  }

  async generateEnhancedRoute(context: RouteContext): Promise<MCPResponse> {
    try {
      // Generate main car route (river)
      const mainRoute = await this.generateMainRoute(context);

      // Find connection points for tributaries
      const connectionPoints = await this.findConnectionPoints(
        mainRoute,
        context.preferences
      );

      // Generate tributary routes
      const tributaryRoutes = await Promise.all(
        connectionPoints.map(point =>
          this.generateTributaryRoute(
            point,
            context.preferences.activityType,
            context
          )
        )
      );

      // Combine routes and enhance with AI
      const combinedRoute = this.combineRoutes(mainRoute, tributaryRoutes);
      const enhancedRoute = await this.enhanceRouteWithAI(combinedRoute, context);

      // Add POI recommendations
      const pois = await this.getPOIRecommendations(context, combinedRoute);

      // Optimize for user experience
      const optimizedResponse = await this.optimizeUserExperience({
        route: enhancedRoute,
        suggestedPOIs: pois,
        metadata: {
          totalDistance: this.calculateTotalDistance(enhancedRoute),
          totalDuration: this.calculateTotalDuration(enhancedRoute),
          totalElevationGain: this.calculateTotalElevation(enhancedRoute),
          difficulty: this.calculateDifficulty(enhancedRoute),
          scenicRating: this.calculateScenicRating(enhancedRoute),
          mainRouteType: 'CAR',
          tributaryActivities: this.getUniqueActivities(enhancedRoute),
          conditions: {
            weather: await this.getWeatherConditions(context),
            traffic: await this.getTrafficConditions(context)
          },
          timing: this.calculateTiming(enhancedRoute, context)
        }
      });

      return optimizedResponse;
    } catch (error) {
      logger.error('Error generating enhanced route:', error);
      throw error;
    }
  }

  private async generateMainRoute(context: RouteContext): Promise<RouteSegment[]> {
    const mainRouteResponse = await this.routeService.generateRoute({
      ...context,
      preferences: {
        ...context.preferences,
        activityType: 'CAR'
      }
    });

    return mainRouteResponse.route.map(segment => ({
      ...segment,
      segmentType: 'MAIN',
      activityType: 'CAR'
    }));
  }

  private async findConnectionPoints(
    mainRoute: RouteSegment[],
    preferences: RouteContext['preferences']
  ): Promise<GeoPoint[]> {
    const points: GeoPoint[] = [];

    for (const segment of mainRoute) {
      // Search for POIs that could serve as connection points
      const pois = await this.poiService.searchPOIs({
        location: segment.points[0],
        radius: 1000,
        activityType: preferences.activityType,
        categories: this.getRelevantCategories(preferences)
      });

      // Filter POIs based on safety and accessibility
      const suitablePOIs = pois.filter(poi => 
        this.isAccessiblePOI(poi, preferences)
      );

      if (suitablePOIs.length > 0) {
        points.push(suitablePOIs[0].location);
      }
    }

    return points;
  }

  private async generateTributaryRoute(
    startPoint: GeoPoint,
    activityType: ActivityType,
    context: RouteContext
  ): Promise<TributaryRoute | null> {
    try {
      // Find suitable POIs for the tributary endpoint
      const pois = await this.poiService.searchPOIs({
        location: startPoint,
        radius: 5000,
        activityType,
        categories: this.getRelevantCategories(context.preferences)
      });

      if (pois.length === 0) return null;

      const bestPOI = pois[0];

      // Generate the tributary route
      const tributaryResponse = await this.routeService.generateRoute({
        startPoint,
        endPoint: bestPOI.location,
        preferences: {
          ...context.preferences,
          activityType
        }
      });

      return {
        route: tributaryResponse.route.map(segment => ({
          ...segment,
          segmentType: 'TRIBUTARY',
          activityType,
          conditions: {
            weather: await this.weatherService.getWeatherForRoute({
              startPoint,
              endPoint: bestPOI.location,
              preferences: { activityType }
            }),
            surface: this.determineSurfaceTypes(tributaryResponse.route),
            safety: this.assessRouteSafety(tributaryResponse.route)
          }
        })),
        connectionPoint: startPoint,
        destinationPOI: bestPOI
      };
    } catch (error) {
      logger.error('Error generating tributary route:', error);
      return null;
    }
  }

  private combineRoutes(
    mainRoute: RouteSegment[],
    tributaries: (TributaryRoute | null)[]
  ): RouteSegment[] {
    const combinedRoute: RouteSegment[] = [...mainRoute];

    tributaries.forEach(tributary => {
      if (tributary) {
        const insertIndex = this.findBestInsertionPoint(
          combinedRoute,
          tributary.connectionPoint
        );
        combinedRoute.splice(insertIndex, 0, ...tributary.route);
      }
    });

    return combinedRoute;
  }

  private async enhanceRouteWithAI(
    route: RouteSegment[],
    context: RouteContext
  ): Promise<RouteSegment[]> {
    const enhancement = await this.aiService.process({
      route,
      context,
      type: 'ROUTE_ENHANCEMENT'
    });

    return enhancement.route;
  }

  private async optimizeUserExperience(response: MCPResponse): Promise<MCPResponse> {
    const enhancement = await this.experienceOptimizer.optimize(response);
    
    return {
      ...response,
      metadata: {
        ...response.metadata,
        userExperience: enhancement
      }
    };
  }

  private async getPOIRecommendations(
    context: RouteContext,
    route: RouteSegment[]
  ): Promise<POIRecommendation[]> {
    const cacheKey = this.generateCacheKey(context);
    if (this.poiCache.has(cacheKey)) {
      return this.poiCache.get(cacheKey)!;
    }

    const pois = await this.poiService.searchPOIs({
      location: context.startPoint,
      radius: this.calculateSearchRadius(route),
      activityType: context.preferences.activityType
    });

    this.poiCache.set(cacheKey, pois);
    return pois;
  }

  // Helper methods
  private generateCacheKey(context: RouteContext): string {
    return `${context.startPoint.lat}-${context.startPoint.lng}-${context.preferences.activityType}`;
  }

  private calculateSearchRadius(route: RouteSegment[]): number {
    const totalDistance = this.calculateTotalDistance(route);
    return Math.min(totalDistance * 0.1, 5000); // 10% of route distance, max 5km
  }

  private findBestInsertionPoint(
    route: RouteSegment[],
    connectionPoint: GeoPoint
  ): number {
    let bestIndex = 0;
    let minDistance = Infinity;

    route.forEach((segment, index) => {
      segment.points.forEach(point => {
        const distance = this.calculateDistance(point, connectionPoint);
        if (distance < minDistance) {
          minDistance = distance;
          bestIndex = index;
        }
      });
    });

    return bestIndex;
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

  private isAccessiblePOI(
    poi: POIRecommendation,
    preferences: RouteContext['preferences']
  ): boolean {
    // Check if POI meets accessibility requirements based on preferences
    if (preferences.urbanPreferences?.safetyPriority === 'high') {
      return poi.details?.ratings?.aspects?.safety > 0.8;
    }
    return true;
  }

  private determineSurfaceTypes(route: RouteSegment[]): string[] {
    // Implement surface type detection logic
    return ['paved', 'trail'];
  }

  private assessRouteSafety(route: RouteSegment[]): 'low' | 'moderate' | 'high' {
    // Implement safety assessment logic
    return 'high';
  }

  private calculateTotalDistance(route: RouteSegment[]): number {
    return route.reduce((total, segment) => total + segment.distance, 0);
  }

  private calculateTotalDuration(route: RouteSegment[]): number {
    return route.reduce((total, segment) => total + segment.duration, 0);
  }

  private calculateTotalElevation(route: RouteSegment[]): number {
    return route.reduce((total, segment) => total + segment.elevationGain, 0);
  }

  private calculateDifficulty(route: RouteSegment[]): 'EASY' | 'MODERATE' | 'HARD' {
    const totalDistance = this.calculateTotalDistance(route);
    const totalElevation = this.calculateTotalElevation(route);
    
    if (totalElevation > totalDistance * 0.1) return 'HARD';
    if (totalElevation > totalDistance * 0.05) return 'MODERATE';
    return 'EASY';
  }

  private calculateScenicRating(route: RouteSegment[]): number {
    // Implement scenic rating calculation logic
    return 4;
  }

  private getUniqueActivities(route: RouteSegment[]): ActivityType[] {
    return Array.from(new Set(route.map(segment => segment.activityType)));
  }

  private async getWeatherConditions(context: RouteContext): Promise<WeatherConditions> {
    return this.weatherService.getWeatherForRoute({
      startPoint: context.startPoint,
      endPoint: context.endPoint,
      preferences: context.preferences
    });
  }

  private async getTrafficConditions(context: RouteContext): Promise<TrafficConditions> {
    // Implement traffic conditions retrieval
    return {
      congestionLevel: 'low',
      averageSpeed: 65,
      predictedDelays: 0
    };
  }

  private calculateTiming(route: RouteSegment[], context: RouteContext) {
    return {
      optimalDepartureTime: new Date().toISOString(),
      estimatedArrivalTime: new Date(Date.now() + this.calculateTotalDuration(route) * 1000).toISOString()
    };
  }

  private async findPOIsAlongSegment(
    segment: RouteSegment,
    context: RouteContext
  ): Promise<POIRecommendation[]> {
    const searchRadius = this.calculateSearchRadius(segment);
    const searchResult = await this.poiService.searchPOIs({
      location: segment.points[0],
      radius: searchRadius,
      activityType: context.preferences.activityType,
      categories: this.getRelevantCategories(context.preferences)
    });

    // Filter POIs based on safety and accessibility
    return searchResult.results.filter(poi => 
      this.isAccessiblePOI(poi, context.preferences)
    );
  }

  private isAccessiblePOI(poi: POIRecommendation, preferences: RoutePreferences): boolean {
    // Check if POI meets accessibility requirements based on preferences
    if (preferences.urbanPreferences?.safetyPriority === 'high') {
      return poi.details?.ratings?.aspects?.safety > 0.8;
    }
    return true;
  }

  private async createTributaryRoute(
    mainSegment: RouteSegment,
    poi: POIRecommendation,
    context: RouteContext
  ): Promise<TributaryRoute | null> {
    try {
      const connectionPoint = this.findOptimalConnectionPoint(mainSegment, poi.location);
      const segments = await this.generateTributarySegments(
        connectionPoint,
        poi.location,
        context
      );

      if (!segments.length) return null;

      return {
        id: `tributary-${poi.id}`,
        activityType: context.preferences.activityType,
        startPoint: connectionPoint,
        endPoint: poi.location,
        segments,
        metadata: {
          totalDistance: this.calculateTotalDistance(segments),
          totalDuration: this.calculateTotalDuration(segments),
          elevationGain: this.calculateTotalElevation(segments),
          difficulty: this.calculateDifficulty(segments),
          conditions: {
            weather: await this.weatherService.getCurrentConditions({
              startPoint: connectionPoint,
              endPoint: poi.location,
              preferences: context.preferences
            }),
            surface: this.determineSurfaceTypes(segments),
            safety: this.calculateSafetyLevel(segments, context)
          }
        }
      };
    } catch (error) {
      console.error('Error creating tributary route:', error);
      return null;
    }
  }
} 