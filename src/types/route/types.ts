import { GeoPoint } from '../geo';
import { WeatherConditions } from '../weather';
import { TerrainConditions } from '../terrain';

export type ActivityType = 'WALK' | 'RUN' | 'BIKE' | 'SKI' | 'CAR' | 'PUBLIC_TRANSPORT';

export type OptimizationType = 
  | 'TIME' 
  | 'DISTANCE' 
  | 'SAFETY' 
  | 'TERRAIN' 
  | 'SNOW_CONDITIONS'
  | 'POINTS_OF_INTEREST' 
  | 'SCENIC' 
  | 'SPEED' 
  | 'RECOVERY';

export interface RoutePreferences {
  activityType: ActivityType;
  avoidHighways?: boolean;
  avoidTraffic?: boolean;
  preferScenic?: boolean;
  optimize?: OptimizationType;
  maxDistance?: number;
  maxDuration?: number;
  maxElevationGain?: number;
  safetyThreshold?: number;
  weatherSensitivity?: number;
  terrainSensitivity?: number;
}

export interface RouteMetrics {
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
    profile: number[];
  };
  safety: number;
  weatherImpact: number | null;
  terrainDifficulty: string;
  surfaceType: string;
  trafficImpact?: number;
  scenicScore?: number;
  pointsOfInterest?: number;
  energyEfficiency?: number;
}

export interface RouteSegment {
  id: string;
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  activityType: ActivityType;
  distance: number;
  duration: number;
  metrics: RouteMetrics;
  waypoints?: GeoPoint[];
  alternatives?: RouteSegment[];
}

export interface Route {
  id: string;
  name: string;
  segments: RouteSegment[];
  preferences: RoutePreferences;
  totalMetrics?: RouteMetrics;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface OptimizationResult {
  path: GeoPoint[];
  metrics: RouteMetrics;
  warnings?: string[];
  alternatives?: GeoPoint[][];
}

export interface DynamicRoutingResult {
  shouldReroute: boolean;
  severity: number;
  reason?: string;
  alternatives?: Route[];
}

export interface RouteValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface RoutingContext {
  weather?: WeatherConditions;
  terrain?: TerrainConditions;
  traffic?: {
    level: number;
    timestamp: Date;
    confidence: number;
  };
  time?: {
    start: Date;
    end?: Date;
  };
  user?: {
    preferences: RoutePreferences;
    history?: {
      routes: Route[];
      activities: ActivityType[];
    };
  };
}

export interface OptimizationOptions {
  considerWeather?: boolean;
  considerTerrain?: boolean;
  considerTraffic?: boolean;
  considerTime?: boolean;
  considerUserHistory?: boolean;
  maxAlternatives?: number;
  optimizationPriority?: OptimizationType[];
}

export interface RouteUpdateEvent {
  type: 'weather' | 'traffic' | 'terrain' | 'emergency' | 'maintenance';
  severity: number;
  affectedSegments: string[];
  alternatives?: Route[];
  timestamp: Date;
}

export interface PerformanceMetrics {
  calculationTime: number;
  optimizationTime: number;
  weatherAnalysisTime?: number;
  terrainAnalysisTime?: number;
  trafficAnalysisTime?: number;
  totalTime: number;
}