import { GeoPoint } from '../geo';
import { ActivityType } from '../activity';

export type RouteType = 'WALK' | 'RUN' | 'BIKE' | 'SKI';

export type OptimizationPreference = 
  | 'TIME' 
  | 'DISTANCE' 
  | 'SAFETY' 
  | 'TERRAIN' 
  | 'SNOW_CONDITIONS'
  | 'POINTS_OF_INTEREST'
  | 'SCENIC'
  | 'SPEED'
  | 'RECOVERY';

export enum TerrainDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXPERT = 'expert',
  INTERMEDIATE = 'intermediate',
  UNKNOWN = 'unknown'
}

export type SurfaceType = 'paved' | 'unpaved' | 'trail' | 'snow' | 'mixed';

export enum TerrainFeature {
  FLAT = 'flat',
  HILLS = 'hills',
  URBAN = 'urban',
  TRAIL = 'trail',
  MOUNTAIN = 'mountain',
  SLOPES = 'slopes',
  GROOMED = 'groomed',
  UNGROOMED = 'ungroomed',
  WINTER_MAINTAINED = 'winter_maintained',
  PARK = 'park'
}

export interface TerrainConditions {
  elevation: number;
  surface: SurfaceType;
  difficulty: TerrainDifficulty;
  features: TerrainFeature[];
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
  terrainDifficulty: TerrainDifficulty;
  surfaceType: SurfaceType;
  trafficLevel?: number;
  shadePercentage?: number;
  snowQuality?: number;
  icyConditions?: number;
  bikeLaneCoverage?: number;
  pointsOfInterest?: Array<{
    type: string;
    location: GeoPoint;
  }>;
  weatherConditions?: string;
  recommendedPace?: number;
  winterMaintained?: boolean;
}

export interface RoutePreferences {
  optimize: OptimizationPreference;
  avoidHills?: boolean;
  preferScenic?: boolean;
  preferBikeLanes?: boolean;
  avoidTraffic?: boolean;
  weatherSensitivity?: 'low' | 'medium' | 'high';
  safetyPriority?: 'normal' | 'maximum';
  preferGroomed?: boolean;
  difficultyLevel?: TerrainDifficulty;
  timeOfDay?: 'flexible' | 'fixed';
  shadePreference?: 'minimum' | 'moderate' | 'maximum';
  winterMaintenance?: 'optional' | 'required';
  weatherAdaptive?: boolean;
  allowIndoorAlternatives?: boolean;
  timeFlexible?: boolean;
  timeWindow?: {
    start: string;
    end: string;
  };
  targetPace?: number;
  preferSoftSurface?: boolean;
  maxDetour?: number;
  poiTypes?: string[];
  bikeType?: 'road' | 'mountain' | 'hybrid';
}

export interface RouteSegment {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  activityType: ActivityType;
  preferences: RoutePreferences;
  path?: GeoPoint[];
  metrics?: RouteMetrics;
}

export interface OptimizationResult {
  path: GeoPoint[];
  metrics: RouteMetrics;
  alternativeRoutes?: Array<{
    path: GeoPoint[];
    metrics: RouteMetrics;
  }>;
  weatherWarnings?: string[];
  indoorAlternatives?: Array<{
    type: string;
    location: GeoPoint;
  }>;
  recommendedStartTime?: string;
  alternativeStartTimes?: string[];
  weatherTransitions?: Array<{
    point: GeoPoint;
    conditions: string;
  }>;
  warnings?: string[];
}

export interface Route {
  segments: Array<{
    path: GeoPoint[];
    metrics: RouteMetrics;
    type: ActivityType;
  }>;
  totalDistance: number;
  estimatedDuration: number;
  alternativeRoutes?: OptimizationResult[];
  weatherWarnings?: string[];
  indoorAlternatives?: Array<{
    type: string;
    location: GeoPoint;
  }>;
  recommendedStartTime?: string;
  alternativeStartTimes?: string[];
  weatherTransitions?: Array<{
    point: GeoPoint;
    conditions: string;
  }>;
  warnings?: string[];
}