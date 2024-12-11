import { GoogleMapsManager } from '../maps/GoogleMapsManager';
import { TrailAPIService } from '../trail/TrailAPIService';
import { SkiAPIService } from '../ski/SkiAPIService';
import { CombinedRoute } from '@/types/combinedRoute';
import { TrailRouteHandler } from './handlers/TrailRouteHandler';
import { SkiRouteHandler } from './handlers/SkiRouteHandler';

export class CombinedRouteManager {
  private trailHandler: TrailRouteHandler;
  private skiHandler: SkiRouteHandler;

  constructor(
    private readonly mapsService: GoogleMapsManager,
    private readonly trailService: TrailAPIService,
    private readonly skiService: SkiAPIService
  ) {
    this.trailHandler = new TrailRouteHandler(trailService, mapsService);
    this.skiHandler = new SkiRouteHandler(skiService, mapsService);
  }

  async createCombinedRoute(params: {
    origin: string;
    trailId?: string;
    resortId?: string;
    activityType: 'trail' | 'ski';
  }): Promise<CombinedRoute> {
    try {
      // Validate parameters
      this.validateParams(params);

      // Get activity-specific route
      const route = params.activityType === 'trail'
        ? await this.trailHandler.createRoute(params.origin, params.trailId!)
        : await this.skiHandler.createRoute(params.origin, params.resortId!);

      return route;
    } catch (error) {
      console.error('Error creating combined route:', error);
      throw this.handleError(error);
    }
  }

  private validateParams(params: {
    origin: string;
    trailId?: string;
    resortId?: string;
    activityType: 'trail' | 'ski';
  }): void {
    if (!params.origin) {
      throw new Error('Origin is required');
    }

    if (params.activityType === 'trail' && !params.trailId) {
      throw new Error('Trail ID is required for trail routes');
    }

    if (params.activityType === 'ski' && !params.resortId) {
      throw new Error('Resort ID is required for ski routes');
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`Route creation failed: ${error.message}`);
    }
    return new Error('An unexpected error occurred while creating the route');
  }

  async combineRoutes(routes: CombinedRoute[]): Promise<CombinedRoute> {
    try {
      const allSegments = routes.flatMap(r => r.segments);
      const allWaypoints = routes.flatMap(r => r.waypoints);
      
      // Calculate total distance
      const totalDistance = routes.reduce(
        (sum, route) => sum + route.metadata.totalDistance,
        0
      );

      // Get the overall difficulty
      const difficulties = routes
        .map(r => r.metadata.difficulty)
        .filter((d): d is string => !!d);
      const maxDifficulty = this.getMaxDifficulty(difficulties);

      // Combine recommended gear
      const recommendedGear = new Set(
        routes.flatMap(r => r.metadata.recommendedGear || [])
      );

      return {
        segments: allSegments,
        waypoints: allWaypoints,
        metadata: {
          totalDistance,
          difficulty: maxDifficulty,
          recommendedGear: Array.from(recommendedGear)
        }
      };
    } catch (error) {
      console.error('Error combining routes:', error);
      throw this.handleError(error);
    }
  }

  private getMaxDifficulty(difficulties: string[]): string {
    const difficultyLevels = {
      'easy': 1,
      'moderate': 2,
      'difficult': 3,
      'expert': 4
    };

    const maxLevel = Math.max(
      ...difficulties.map(d => difficultyLevels[d as keyof typeof difficultyLevels] || 0)
    );

    return Object.entries(difficultyLevels)
      .find(([_, value]) => value === maxLevel)?.[0] || 'moderate';
  }
} 