import { CombinedRoute, RouteSegment } from '@/types/combinedRoute';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrailAPIService } from '@/services/trail/TrailAPIService';
import { SkiAPIService } from '@/services/ski/SkiAPIService';
import { LatLng } from '@/types/shared';
import { RouteProgress as DetailedProgress } from '@/types/progress';

// Legacy progress interface - keep for backward compatibility
export interface RouteProgress {
  currentSegmentIndex: number;
  distanceCovered: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  currentLocation: LatLng;
  nextMilestone?: {
    type: 'waypoint' | 'segment-end' | 'destination';
    distance: number;
    estimatedTime: number;
  };
  completionPercentage: number;
}

export interface RouteStatus {
  id: string;
  timestamp: Date;
  progress: RouteProgress;
  detailedProgress?: DetailedProgress; // New detailed progress tracking
  conditions: {
    weather: {
      temperature: number;
      conditions: string;
      alerts?: string[];
    };
    traffic?: {
      incidents: string[];
      congestion: 'low' | 'moderate' | 'heavy';
    };
    trail?: {
      status: 'open' | 'closed' | 'warning';
      conditions: string;
      alerts?: string[];
    };
    resort?: {
      status: 'open' | 'closed';
      liftStatus: Record<string, boolean>;
      snowConditions: string;
    };
  };
  recommendations: string[];
}

export class RouteMonitor {
  private monitors: Map<string, NodeJS.Timeout> = new Map();
  private progressTrackers: Map<string, NodeJS.Timeout> = new Map();
  private userLocations: Map<string, LatLng> = new Map();

  constructor(
    private readonly weatherService: WeatherService,
    private readonly trailService: TrailAPIService,
    private readonly skiService: SkiAPIService
  ) {}

  private async checkWeather(route: CombinedRoute) {
    const firstSegment = route.segments[0];
    const location = firstSegment.path[0];
    
    const weather = await this.weatherService.getCurrentConditions(location);
    return {
      temperature: weather.temperature,
      conditions: weather.conditions,
      alerts: this.generateWeatherAlerts(weather)
    };
  }

  private async checkTrailConditions(segment: RouteSegment) {
    try {
      const trailConditions = await this.trailService.getTrailConditions(segment.details.trailId);
      return {
        status: trailConditions.status,
        conditions: trailConditions.surface,
        alerts: this.generateTrailAlerts(trailConditions)
      };
    } catch (error) {
      console.error('Failed to check trail conditions:', error);
      return {
        status: 'warning' as const,
        conditions: 'unknown',
        alerts: ['Unable to verify trail conditions']
      };
    }
  }

  private async checkResortConditions(segment: RouteSegment) {
    try {
      const resort = await this.skiService.getResortInfo(segment.details.resortId);
      const snowReport = await this.skiService.getSnowReport(segment.details.resortId);
      const liftStatus = await this.skiService.getLiftStatus(segment.details.resortId);

      return {
        status: resort.status as 'open' | 'closed',
        liftStatus: this.formatLiftStatus(liftStatus),
        snowConditions: snowReport.conditions
      };
    } catch (error) {
      console.error('Failed to check resort conditions:', error);
      return {
        status: 'closed' as const,
        liftStatus: {},
        snowConditions: 'unknown'
      };
    }
  }

  private generateWeatherAlerts(weather: WeatherConditions): string[] {
    const alerts: string[] = [];
    
    if (weather.temperature > 95) {
      alerts.push('Extreme heat warning');
    }
    if (weather.temperature < 32) {
      alerts.push('Freezing conditions');
    }
    if (weather.visibility < 5) {
      alerts.push('Low visibility conditions');
    }
    if (weather.precipitation > 0.5) {
      alerts.push('Heavy precipitation');
    }

    return alerts;
  }

  private generateTrailAlerts(conditions: TrailConditions): string[] {
    const alerts: string[] = [];
    
    if (conditions.status === 'warning') {
      alerts.push(...conditions.hazards);
    }
    if (conditions.status === 'closed') {
      alerts.push('Trail is currently closed');
    }

    return alerts;
  }

  private formatLiftStatus(lifts: LiftStatus[]): Record<string, boolean> {
    return lifts.reduce((acc, lift) => {
      acc[lift.name] = lift.status === 'open';
      return acc;
    }, {} as Record<string, boolean>);
  }

  private generateRecommendations(status: RouteStatus): string[] {
    const recommendations: string[] = [];

    // Weather-based recommendations
    if (status.conditions.weather.temperature > 90) {
      recommendations.push('Bring extra water and sun protection');
    }
    if (status.conditions.weather.temperature < 40) {
      recommendations.push('Dress in warm layers');
    }

    // Trail-specific recommendations
    if (status.conditions.trail?.status === 'warning') {
      recommendations.push('Exercise extra caution on trails');
    }

    // Resort-specific recommendations
    if (status.conditions.resort) {
      const openLifts = Object.values(status.conditions.resort.liftStatus).filter(Boolean).length;
      if (openLifts < 3) {
        recommendations.push('Limited lift operations - expect longer wait times');
      }
    }

    return recommendations;
  }

  async startProgressTracking(routeId: string, onProgress: (progress: RouteProgress) => void) {
    // Update every 10 seconds
    const tracker = setInterval(async () => {
      const progress = await this.calculateProgress(routeId);
      onProgress(progress);
    }, 10000);

    this.progressTrackers.set(routeId, tracker);
  }

  stopProgressTracking(routeId: string) {
    const tracker = this.progressTrackers.get(routeId);
    if (tracker) {
      clearInterval(tracker);
      this.progressTrackers.delete(routeId);
    }
  }

  updateUserLocation(routeId: string, location: LatLng) {
    this.userLocations.set(routeId, location);
  }

  private async calculateProgress(routeId: string): Promise<RouteProgress> {
    const route = await this.getRoute(routeId);
    const currentLocation = this.userLocations.get(routeId);

    if (!route || !currentLocation) {
      throw new Error('Route or user location not found');
    }

    // Calculate basic progress (legacy)
    const { segmentIndex, segmentProgress } = this.findCurrentSegment(route, currentLocation);
    const totalDistance = route.segments.reduce((sum, seg) => sum + seg.details.distance, 0);
    const coveredDistance = this.calculateCoveredDistance(route, segmentIndex, segmentProgress);

    const basicProgress: RouteProgress = {
      currentSegmentIndex: segmentIndex,
      distanceCovered: coveredDistance,
      timeElapsed: this.calculateTimeElapsed(route.startTime),
      estimatedTimeRemaining: this.estimateRemainingTime(route, coveredDistance),
      currentLocation,
      nextMilestone: this.findNextMilestone(route, segmentIndex, currentLocation),
      completionPercentage: (coveredDistance / totalDistance) * 100
    };

    // Calculate detailed progress (new)
    const detailedProgress: DetailedProgress = {
      core: this.calculateCoreProgress(route, currentLocation),
      segment: this.calculateSegmentProgress(route, currentLocation),
      milestone: this.calculateMilestoneProgress(route, currentLocation),
      environmental: this.calculateEnvironmentalProgress(route, currentLocation),
      safety: this.calculateSafetyProgress(route, currentLocation),
      optimization: this.calculateRouteOptimization(route, currentLocation)
    };

    return {
      ...basicProgress,
      detailedProgress // Add detailed progress as an optional field
    };
  }

  private findCurrentSegment(route: CombinedRoute, location: LatLng) {
    // Find closest point on route to current location
    let minDistance = Infinity;
    let currentSegmentIndex = 0;
    let segmentProgress = 0;

    route.segments.forEach((segment, index) => {
      const { distance, progress } = this.calculateDistanceToSegment(segment, location);
      if (distance < minDistance) {
        minDistance = distance;
        currentSegmentIndex = index;
        segmentProgress = progress;
      }
    });

    return { segmentIndex: currentSegmentIndex, segmentProgress };
  }

  private calculateDistanceToSegment(segment: RouteSegment, location: LatLng) {
    // Implementation using Google Maps geometry library
    const path = segment.path.map(point => new google.maps.LatLng(point.lat, point.lng));
    const userLatLng = new google.maps.LatLng(location.lat, location.lng);
    
    // Find closest point on path
    const closest = google.maps.geometry.spherical.computeClosestPointOnPath(
      userLatLng,
      path,
      true // geodesic
    );

    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, closest);
    const progress = this.calculateProgressAlongPath(path, closest);

    return { distance, progress };
  }

  // ... helper methods for calculations ...
} 