import type { 
  Coordinates, 
  ActivityType, 
  RoutePreferences,
  RouteMetrics,
  Result 
} from '@/types';

export class RouteEngine {
  private static instance: RouteEngine;
  
  private constructor() {}

  static getInstance(): RouteEngine {
    if (!RouteEngine.instance) {
      RouteEngine.instance = new RouteEngine();
    }
    return RouteEngine.instance;
  }

  async calculateRoute(params: {
    start: Coordinates;
    end: Coordinates;
    activity: ActivityType;
    preferences: RoutePreferences;
    waypoints?: Coordinates[];
  }): Promise<Result<RouteMetrics>> {
    try {
      // Get optimal path
      const path = await this.pathFinder.findPath({
        points: [params.start, ...(params.waypoints || []), params.end],
        activity: params.activity,
        preferences: params.preferences
      });

      // Calculate elevation profile
      const elevation = await this.elevationService.getProfile(path);

      // Get current conditions
      const conditions = await this.conditionService.getConditions(path);

      // Calculate final metrics
      const metrics = this.calculateMetrics(path, elevation, conditions);

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  private calculateMetrics(
    path: Coordinates[], 
    elevation: ElevationProfile,
    conditions: EnvironmentalConditions
  ): RouteMetrics {
    const segments = this.segmentPath(path, elevation, conditions);
    const surfaces = this.analyzeSurfaces(segments);
    
    return {
      totalDistance: segments.reduce((sum, seg) => sum + seg.distance, 0),
      totalDuration: segments.reduce((sum, seg) => sum + seg.duration, 0),
      elevation: {
        totalGain: elevation.gains.reduce((sum, gain) => sum + gain, 0),
        totalLoss: elevation.losses.reduce((sum, loss) => sum + loss, 0),
        maxAltitude: Math.max(...elevation.profile),
        minAltitude: Math.min(...elevation.profile),
        profile: elevation.profile
      },
      segments,
      difficulty: this.calculateDifficulty(segments, elevation),
      surfaces: surfaces.map(surface => ({
        type: surface.type,
        percentage: surface.distance / this.getTotalDistance(segments)
      }))
    };
  }

  private segmentPath(
    path: Coordinates[], 
    elevation: ElevationProfile,
    conditions: EnvironmentalConditions
  ): RouteSegment[] {
    return path.slice(0, -1).map((start, i) => ({
      start,
      end: path[i + 1],
      distance: this.calculateDistance(start, path[i + 1]),
      duration: this.estimateDuration(start, path[i + 1], conditions),
      elevation: {
        gain: elevation.gains[i],
        loss: elevation.losses[i],
        profile: elevation.profile.slice(i, i + 2)
      },
      surface: this.detectSurface(start, path[i + 1]),
      conditions: this.getSegmentConditions(start, path[i + 1], conditions)
    }));
  }
} 