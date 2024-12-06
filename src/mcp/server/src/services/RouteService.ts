import { POIService } from './POIService';
import { WeatherService } from './WeatherService';
import {
  RouteRequest,
  RouteSegment,
  GeoPoint,
  ActivityType,
  POIRecommendation,
  WeatherConditions,
  TrafficConditions,
  POISearchRequest,
  POISearchResult
} from '../../../types/mcp.types';

interface SkiRouteOptions {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferGroomed?: boolean;
  avoidCrowds?: boolean;
  maxWaitTime?: number;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

export class RouteService {
  constructor(
    private poiService: POIService,
    private weatherService: WeatherService
  ) {}

  async generateRoute(request: RouteRequest): Promise<{ route: RouteSegment[] }> {
    const { startPoint, endPoint, preferences } = request;
    const activityType = preferences.activityType;

    if (activityType === 'SKI') {
      return this.generateSkiRoute(request);
    }

    // Default route generation for other activities
    const route: RouteSegment[] = [{
      points: [startPoint, endPoint],
      distance: this.calculateDistance(startPoint, endPoint),
      duration: this.estimateDuration(startPoint, endPoint, activityType),
      elevationGain: await this.calculateElevationGain(startPoint, endPoint),
      activityType,
      segmentType: 'MAIN',
      conditions: {
        weather: await this.weatherService.getWeatherForRoute(request),
        surface: this.getSurfaceTypes(activityType),
        difficulty: this.calculateDifficulty(startPoint, endPoint),
        safety: this.assessSafety(activityType)
      }
    }];

    return { route };
  }

  private async generateSkiRoute(request: RouteRequest): Promise<{ route: RouteSegment[] }> {
    const { startPoint, preferences } = request;
    const skiOptions = preferences as unknown as SkiRouteOptions;

    // Get all resort POIs
    const pois = await this.poiService.searchPOIs({
      location: startPoint,
      radius: 5000,
      activityType: 'SKI'
    });

    // Filter lifts and runs based on preferences
    const lifts = pois.filter(poi => poi.category === 'ski_lift');
    const runs = pois.filter(poi => poi.category === 'ski_run');
    const facilities = pois.filter(poi => 
      ['lodge', 'restaurant', 'service'].includes(poi.category)
    );

    // Generate route segments
    const route: RouteSegment[] = [];
    const weather = await this.weatherService.getWeatherForRoute(request);

    // Add base lodge to summit route
    const baseLodge = facilities.find(f => f.category === 'lodge');
    const summitLift = this.findBestLift(lifts, skiOptions);
    
    if (baseLodge && summitLift) {
      route.push({
        points: [baseLodge.location, summitLift.location],
        distance: this.calculateDistance(baseLodge.location, summitLift.location),
        duration: 10 * 60, // 10 minutes in seconds
        elevationGain: 0,
        activityType: 'SKI',
        segmentType: 'MAIN',
        conditions: {
          weather,
          surface: ['snow'],
          difficulty: 'easy',
          safety: 'high'
        }
      });
    }

    // Add lift ride
    if (summitLift) {
      const liftTop: GeoPoint = {
        lat: summitLift.location.lat,
        lng: summitLift.location.lng + 0.002 // Approximate summit location
      };

      route.push({
        points: [summitLift.location, liftTop],
        distance: this.calculateDistance(summitLift.location, liftTop),
        duration: 15 * 60, // 15 minutes in seconds
        elevationGain: 500, // Approximate vertical
        activityType: 'SKI',
        segmentType: 'TRIBUTARY',
        conditions: {
          weather,
          surface: ['snow'],
          difficulty: 'easy',
          safety: 'high'
        }
      });

      // Add ski runs
      const bestRuns = this.findBestRuns(runs, skiOptions);
      for (const run of bestRuns) {
        route.push({
          points: [liftTop, run.location],
          distance: run.length || this.calculateDistance(liftTop, run.location),
          duration: this.estimateSkiDuration(run),
          elevationGain: -run.verticalDrop || -300, // Negative for descent
          activityType: 'SKI',
          segmentType: 'TRIBUTARY',
          conditions: {
            weather,
            surface: ['snow'],
            difficulty: this.convertSkiDifficulty(run.difficulty),
            safety: this.assessSkiSafety(run, weather)
          }
        });
      }
    }

    return { route };
  }

  private findBestLift(lifts: POIRecommendation[], options: SkiRouteOptions): any {
    return lifts.find(lift => 
      lift.status === 'open' &&
      (!options.maxWaitTime || lift.waitTime <= options.maxWaitTime)
    );
  }

  private findBestRuns(runs: POIRecommendation[], options: SkiRouteOptions): any[] {
    return runs
      .filter(run => 
        run.status === 'open' &&
        this.matchesDifficulty(run.difficulty, options.difficulty) &&
        (!options.preferGroomed || run.conditions?.groomed)
      )
      .slice(0, 3); // Return top 3 matching runs
  }

  private matchesDifficulty(runDifficulty: string, preferredDifficulty: string): boolean {
    const difficultyMap = {
      beginner: ['green'],
      intermediate: ['blue'],
      advanced: ['black'],
      expert: ['doubleBlack']
    };
    return difficultyMap[preferredDifficulty]?.includes(runDifficulty) || false;
  }

  private convertSkiDifficulty(difficulty: string): 'easy' | 'moderate' | 'hard' {
    const difficultyMap = {
      green: 'easy',
      blue: 'moderate',
      black: 'hard',
      doubleBlack: 'hard'
    };
    return difficultyMap[difficulty] || 'moderate';
  }

  private assessSkiSafety(run: any, weather: WeatherConditions): 'low' | 'moderate' | 'high' {
    if (weather.avalancheRisk === 'high') return 'low';
    if (weather.avalancheRisk === 'moderate') return 'moderate';
    if (run.difficulty === 'doubleBlack') return 'moderate';
    return 'high';
  }

  private estimateSkiDuration(run: any): number {
    const baseSpeed = 20; // km/h
    const difficultyFactor = {
      green: 0.7,
      blue: 1.0,
      black: 1.3,
      doubleBlack: 1.5
    };
    const speed = baseSpeed * difficultyFactor[run.difficulty];
    return (run.length / speed) * 3600; // Convert to seconds
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

  private estimateDuration(start: GeoPoint, end: GeoPoint, activityType: ActivityType): number {
    const distance = this.calculateDistance(start, end);
    const speedMap: Record<ActivityType, number> = {
      WALK: 5000,    // 5 km/h
      RUN: 10000,    // 10 km/h
      BIKE: 20000,   // 20 km/h
      CAR: 60000,    // 60 km/h
      SKI: 15000     // 15 km/h
    };
    const speed = speedMap[activityType] || 5000;
    return (distance / speed) * 3600; // Convert to seconds
  }

  private async calculateElevationGain(start: GeoPoint, end: GeoPoint): Promise<number> {
    // Implement elevation calculation logic
    return 100; // Placeholder value
  }

  private getSurfaceTypes(activityType: ActivityType): string[] {
    switch (activityType) {
      case 'WALK':
      case 'RUN':
        return ['paved', 'trail'];
      case 'BIKE':
        return ['paved', 'gravel'];
      case 'SKI':
        return ['snow'];
      case 'CAR':
        return ['paved'];
      default:
        return ['paved'];
    }
  }

  private assessSafety(activityType: ActivityType): 'low' | 'moderate' | 'high' {
    switch (activityType) {
      case 'CAR':
        return 'high'; // Assuming well-maintained roads
      case 'WALK':
        return 'high'; // Assuming urban areas
      case 'RUN':
      case 'BIKE':
        return 'moderate'; // Mixed terrain
      case 'SKI':
        return 'moderate'; // Controlled environment but inherent risks
      default:
        return 'moderate';
    }
  }

  async findConnectionPoints(
    route: RouteSegment[],
    activityType: ActivityType
  ): Promise<GeoPoint[]> {
    const points: GeoPoint[] = [];
    const segmentPoints = route.flatMap(segment => segment.points);

    // Search for POIs near each point that could serve as connection points
    for (const point of segmentPoints) {
      const pois = await this.poiService.searchPOIs({
        location: point,
        radius: 1000,
        activityType
      });

      if (pois.length > 0) {
        points.push(pois[0].location);
      }
    }

    return points;
  }

  async optimizeRoute(
    mainRoute: RouteSegment[],
    tributaries: RouteSegment[]
  ): Promise<RouteSegment[]> {
    // Implement route optimization logic
    // For now, just combine the routes
    return [...mainRoute, ...tributaries];
  }

  private async getSkiResortPOIs(request: POISearchRequest): Promise<POIRecommendation[]> {
    const searchResult = await this.poiService.searchPOIs(request);
    return searchResult.results.filter((poi: POIRecommendation) => {
      if (poi.category === 'ski_lift') {
        return this.isValidSkiLift(poi);
      }
      if (poi.category === 'ski_run') {
        return this.isValidSkiRun(poi);
      }
      return ['lodge', 'restaurant', 'service'].includes(poi.category);
    });
  }

  private isValidSkiLift(poi: POIRecommendation): boolean {
    return (
      poi.details?.amenities?.includes('lift') &&
      poi.details?.openingHours !== undefined
    );
  }

  private isValidSkiRun(poi: POIRecommendation): boolean {
    return (
      poi.details?.amenities?.includes('ski_run') &&
      poi.details?.ratings?.overall !== undefined
    );
  }

  private calculateDifficulty(poi: POIRecommendation): 'easy' | 'moderate' | 'hard' {
    const rating = poi.details?.ratings?.overall || 0;
    if (rating > 4) return 'hard';
    if (rating > 3) return 'moderate';
    return 'easy';
  }
} 