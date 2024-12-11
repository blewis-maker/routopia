import { LatLng } from '../shared';
import { RouteSegmentType } from '../combinedRoute';

// Core Progress Types
export interface CoreProgress {
  distanceCovered: number;      // meters
  timeElapsed: number;          // seconds
  currentSpeed: number;         // m/s
  averageSpeed: number;         // m/s
  completionPercentage: number;
  currentLocation: LatLng;
  lastKnownLocation: LatLng;
  isMoving: boolean;
  heading: number;              // degrees
}

// Segment Progress
export interface SegmentProgress {
  currentSegmentIndex: number;
  segmentType: RouteSegmentType;
  segmentProgress: number;      // percentage
  segmentMetrics: {
    distance: number;
    elevation: number;
    difficulty: string;
    estimatedTime: number;
  };
}

// Milestone System
export interface MilestoneProgress {
  nextMilestone: {
    type: 'waypoint' | 'segment-end' | 'destination' | 'rest-stop';
    distance: number;
    estimatedTime: number;
    elevation?: number;
  };
  passedMilestones: {
    timestamp: Date;
    type: string;
    location: LatLng;
  }[];
}

// Environmental Tracking
export interface EnvironmentalProgress {
  weather: {
    temperature: number;
    conditions: string;
    windSpeed: number;
  };
  terrain: {
    surface: string;
    condition: string;
    difficulty: string;
  };
  daylight: {
    isDay: boolean;
    sunsetIn?: number;
    sunriseIn?: number;
  };
}

// Safety Tracking
export interface SafetyProgress {
  offRoute: boolean;
  offRouteDistance: number;
  lastCheckpoint: {
    location: LatLng;
    timestamp: Date;
  };
  emergencyInfo: {
    nearestHelp: LatLng;
    cellSignal: boolean;
    lastKnownSafePoint: LatLng;
  };
}

// Route Optimization
export interface RouteOptimization {
  alternativeRoutes: {
    available: boolean;
    betterOptions: {
      type: 'faster' | 'easier' | 'scenic';
      savingsMinutes?: number;
      extraDistance?: number;
    }[];
  };
  dynamicRerouting: {
    needed: boolean;
    reason?: string;
    suggestion?: string;
  };
}

// Combined Progress Type
export interface RouteProgress {
  core: CoreProgress;
  segment: SegmentProgress;
  milestone: MilestoneProgress;
  environmental: EnvironmentalProgress;
  safety: SafetyProgress;
  optimization: RouteOptimization;
} 