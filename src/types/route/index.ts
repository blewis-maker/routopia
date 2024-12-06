import { GeoPoint } from '../geo';
import { ActivityType } from '../activity';
import { WeatherConditions } from '../weather';
import { TrafficAnalysis } from '../traffic';
import { SocialFactors } from '../social';
import { FacilityStatus } from '../facility';
import { OptimizationFactors, OptimizationMetrics, OptimizationAlert } from '../optimization';

// Re-export all types
export * from './types';

// Core types
export interface SegmentConnection {
  type: 'start' | 'end' | 'intersection';
  point: GeoPoint;
  connectedSegments: string[]; // segment IDs
  transitionType: 'direct' | 'modal_change' | 'rest_stop' | 'intersection';
  waitTime?: number; // in minutes
  facilities?: FacilityStatus[];
}

export interface RouteSegment {
  id: string;
  points: GeoPoint[];
  distance: number;
  duration: number;
  elevationGain: number;
  activityType: ActivityType;
  segmentType: 'MAIN' | 'TRIBUTARY';
  segmentRole: 'PRIMARY' | 'ALTERNATIVE' | 'CONNECTOR' | 'SCENIC' | 'SHORTCUT';
  conditions: {
    weather: WeatherConditions;
    surface: TerrainConditions['surface'];
    difficulty: TerrainConditions['difficulty'];
    safety: 'low' | 'moderate' | 'high';
  };
  facilities?: FacilityStatus[];
  traffic?: TrafficAnalysis;
  social?: SocialFactors;
  connections: {
    start: SegmentConnection;
    end: SegmentConnection;
    intersections: SegmentConnection[];
  };
  tributaries?: {
    entry: SegmentConnection;
    segments: RouteSegment[];
    exit: SegmentConnection;
    purpose: 'scenic' | 'activity' | 'rest' | 'alternative';
  }[];
  metadata?: {
    scenicScore?: number;
    difficultyScore?: number;
    popularityScore?: number;
    maintenanceStatus?: string;
    lastUpdated: string;
  };
}

export interface TerrainConditions {
  elevation: number;
  slope: number;
  surface: 'paved' | 'unpaved' | 'trail' | 'mixed';
  difficulty: 'easy' | 'moderate' | 'difficult' | 'expert';
  technicalFeatures: string[];
}

export interface RoutePreferences {
  activityType: ActivityType;
  optimizationPreferences?: {
    restStopFrequency?: number; // kilometers
    avoidCrowds?: boolean;
    preferPopularRoutes?: boolean;
    maxTrafficDelay?: number; // minutes
    safetyPriority?: 'low' | 'medium' | 'high';
    comfortPriority?: 'low' | 'medium' | 'high';
    allowTributaries?: boolean;
    maxTributaryLength?: number; // kilometers
    preferredTributaryTypes?: ('scenic' | 'activity' | 'rest' | 'alternative')[];
    multiModalTransport?: boolean;
  };
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  maxElevationGain?: number;
  maxDistance?: number;
  maxDuration?: number;
  preferredSurface?: TerrainConditions['surface'];
  maxDifficulty?: TerrainConditions['difficulty'];
}

export interface RouteContext {
  id: string;
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  routeType: ActivityType;
  segments: RouteSegment[];
  mainPath: string[]; // Array of segment IDs forming the main route
  tributaryPaths: {
    id: string;
    segments: string[];
    entryPoint: GeoPoint;
    exitPoint: GeoPoint;
    purpose: 'scenic' | 'activity' | 'rest' | 'alternative';
  }[];
  preferences: RoutePreferences;
  optimization?: {
    lastUpdated: string;
    factors: OptimizationFactors;
    metrics: OptimizationMetrics;
    alternativeRoutes?: RouteSegment[][];
    alerts?: OptimizationAlert[];
  };
}

export interface RouteRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: RoutePreferences;
  waypoints?: GeoPoint[];
  tributaryPreferences?: {
    maxDetourTime?: number;
    maxTributaries?: number;
    allowedActivities?: ActivityType[];
  };
}

// Additional types for multi-modal routing
export interface TransitionPoint {
  location: GeoPoint;
  fromActivity: ActivityType;
  toActivity: ActivityType;
  facilities: FacilityStatus[];
  waitTime: number;
  schedule?: {
    nextDeparture: string;
    frequency: number;
    operatingHours: string[];
  };
}

export interface MultiModalSegment extends RouteSegment {
  transitionPoints: TransitionPoint[];
  alternativeModes: ActivityType[];
  modeSwitchCost: {
    time: number;
    distance: number;
    convenience: number;
  };
}

export interface SegmentOptimizationResult {
  segment: RouteSegment;
  score: number;
  metrics: OptimizationMetrics;
  alternatives: RouteSegment[];
} 