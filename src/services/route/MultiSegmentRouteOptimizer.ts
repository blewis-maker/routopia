import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { CarRouteOptimizer } from './CarRouteOptimizer';
import {
  GeoPoint,
  RoutePreferences,
  OptimizationResult,
  RouteSegment,
  TerrainDifficulty
} from '@/types/route/types';
import logger from '@/utils/logger';

export class MultiSegmentRouteOptimizer {
  constructor(
    private readonly mcpService: MCPIntegrationService,
    private readonly carRouteOptimizer: CarRouteOptimizer
  ) {}

  async optimizeMultiSegmentRoute(
    segments: RouteSegment[],
    preferences: RoutePreferences
  ): Promise<OptimizationResult[]> {
    try {
      // Validate segments
      this.validateSegments(segments);

      // Optimize each segment
      const optimizedSegments = await Promise.all(
        segments.map(async (segment) => {
          switch (segment.activityType) {
            case 'CAR':
              return this.carRouteOptimizer.optimizeRoute(
                segment.startPoint,
                segment.endPoint,
                { ...preferences, ...segment.preferences }
              );
            case 'WALK':
              return this.optimizeWalkingSegment(segment, preferences);
            case 'BIKE':
              return this.optimizeBikingSegment(segment, preferences);
            case 'PUBLIC_TRANSPORT':
              return this.optimizePublicTransportSegment(segment, preferences);
            default:
              throw new Error(`Unsupported activity type: ${segment.activityType}`);
          }
        })
      );

      // Optimize transitions between segments
      const optimizedTransitions = await this.optimizeTransitions(
        segments,
        optimizedSegments
      );

      // Combine segments with optimized transitions
      return this.combineSegments(optimizedSegments, optimizedTransitions);
    } catch (error) {
      logger.error('Failed to optimize multi-segment route:', error);
      throw error;
    }
  }

  private validateSegments(segments: RouteSegment[]): void {
    if (!segments.length) {
      throw new Error('No segments provided');
    }

    // Validate segment continuity
    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];

      if (
        !this.arePointsEqual(currentSegment.endPoint, nextSegment.startPoint)
      ) {
        throw new Error(
          `Segment discontinuity between segments ${i} and ${i + 1}`
        );
      }
    }
  }

  private arePointsEqual(point1: GeoPoint, point2: GeoPoint): boolean {
    const EPSILON = 1e-10; // Small difference threshold for floating point comparison
    return (
      Math.abs(point1.lat - point2.lat) < EPSILON &&
      Math.abs(point1.lng - point2.lng) < EPSILON
    );
  }

  private async optimizeWalkingSegment(
    segment: RouteSegment,
    preferences: RoutePreferences
  ): Promise<OptimizationResult> {
    // Get walking-specific route data
    const elevationProfile = await this.mcpService.getElevationProfile(
      segment.startPoint,
      segment.endPoint
    );

    // Calculate optimal walking route
    const baseRoute = await this.mcpService.getBaseRoute(
      segment.startPoint,
      segment.endPoint
    );

    return {
      path: baseRoute.path,
      metrics: {
        distance: baseRoute.distance,
        duration: baseRoute.duration,
        elevation: {
          gain: 100, // Placeholder values
          loss: 50,
          profile: []
        },
        safety: 0.95,
        weatherImpact: null,
        terrainDifficulty: TerrainDifficulty.EASY,
        surfaceType: 'sidewalk'
      },
      warnings: []
    };
  }

  private async optimizeBikingSegment(
    segment: RouteSegment,
    preferences: RoutePreferences
  ): Promise<OptimizationResult> {
    // Get biking-specific route data
    const elevationProfile = await this.mcpService.getElevationProfile(
      segment.startPoint,
      segment.endPoint
    );

    // Calculate optimal biking route
    const baseRoute = await this.mcpService.getBaseRoute(
      segment.startPoint,
      segment.endPoint
    );

    return {
      path: baseRoute.path,
      metrics: {
        distance: baseRoute.distance,
        duration: baseRoute.duration,
        elevation: {
          gain: 150, // Placeholder values
          loss: 75,
          profile: []
        },
        safety: 0.85,
        weatherImpact: null,
        terrainDifficulty: TerrainDifficulty.MODERATE,
        surfaceType: 'bike_lane'
      },
      warnings: []
    };
  }

  private async optimizePublicTransportSegment(
    segment: RouteSegment,
    preferences: RoutePreferences
  ): Promise<OptimizationResult> {
    // Get public transport-specific route data
    const baseRoute = await this.mcpService.getBaseRoute(
      segment.startPoint,
      segment.endPoint
    );

    return {
      path: baseRoute.path,
      metrics: {
        distance: baseRoute.distance,
        duration: baseRoute.duration,
        elevation: {
          gain: 0,
          loss: 0,
          profile: []
        },
        safety: 0.98,
        weatherImpact: null,
        terrainDifficulty: TerrainDifficulty.EASY,
        surfaceType: 'rail'
      },
      warnings: []
    };
  }

  private async optimizeTransitions(
    segments: RouteSegment[],
    optimizedSegments: OptimizationResult[]
  ): Promise<OptimizationResult[]> {
    const transitions: OptimizationResult[] = [];

    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];

      // Calculate transition metrics
      const transitionMetrics = await this.calculateTransitionMetrics(
        currentSegment,
        nextSegment,
        optimizedSegments[i],
        optimizedSegments[i + 1]
      );

      transitions.push(transitionMetrics);
    }

    return transitions;
  }

  private async calculateTransitionMetrics(
    currentSegment: RouteSegment,
    nextSegment: RouteSegment,
    currentOptimized: OptimizationResult,
    nextOptimized: OptimizationResult
  ): Promise<OptimizationResult> {
    // Calculate waiting times, transfer distances, etc.
    const transitionPoint = currentSegment.endPoint;

    return {
      path: [transitionPoint],
      metrics: {
        distance: 0,
        duration: this.calculateTransitionDuration(
          currentSegment.activityType,
          nextSegment.activityType
        ),
        elevation: {
          gain: 0,
          loss: 0,
          profile: []
        },
        safety: 0.95,
        weatherImpact: null,
        terrainDifficulty: TerrainDifficulty.EASY,
        surfaceType: 'transfer'
      },
      warnings: []
    };
  }

  private calculateTransitionDuration(
    fromActivity: string,
    toActivity: string
  ): number {
    // Define transition durations based on activity types
    const transitionMatrix: { [key: string]: { [key: string]: number } } = {
      CAR: {
        WALK: 300, // 5 minutes to park and start walking
        BIKE: 600, // 10 minutes to park and get bike ready
        PUBLIC_TRANSPORT: 600 // 10 minutes to park and reach station
      },
      WALK: {
        CAR: 300, // 5 minutes to reach and enter car
        BIKE: 300, // 5 minutes to reach and prepare bike
        PUBLIC_TRANSPORT: 300 // 5 minutes to reach station
      },
      BIKE: {
        CAR: 600, // 10 minutes to secure bike and enter car
        WALK: 300, // 5 minutes to secure bike and start walking
        PUBLIC_TRANSPORT: 600 // 10 minutes to secure bike and reach station
      },
      PUBLIC_TRANSPORT: {
        CAR: 600, // 10 minutes to exit station and reach car
        WALK: 300, // 5 minutes to exit station and start walking
        BIKE: 600 // 10 minutes to exit station and prepare bike
      }
    };

    return (
      transitionMatrix[fromActivity]?.[toActivity] ||
      300 // Default 5 minutes if not specified
    );
  }

  private combineSegments(
    segments: OptimizationResult[],
    transitions: OptimizationResult[]
  ): OptimizationResult[] {
    const combined: OptimizationResult[] = [];

    segments.forEach((segment, index) => {
      combined.push(segment);
      if (transitions[index]) {
        combined.push(transitions[index]);
      }
    });

    return combined;
  }
} 