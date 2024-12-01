import type { 
  Coordinates, 
  ActivityType, 
  EnvironmentalConditions 
} from './activities';

export interface RouteRequest {
  start: Coordinates;
  end: Coordinates;
  activity: ActivityType;
  preferences: RoutePreferences;
  waypoints?: Coordinates[];
  options?: RouteOptions;
}

export interface RouteResponse {
  path: Coordinates[];
  metrics: RouteMetrics;
  conditions: EnvironmentalConditions;
  alternatives?: AlternativeRoute[];
}

export interface RouteOptions {
  alternatives?: boolean;
  avoidances?: string[];
  optimize?: 'distance' | 'time' | 'elevation';
  units?: 'metric' | 'imperial';
}

export interface AlternativeRoute {
  id: string;
  path: Coordinates[];
  metrics: RouteMetrics;
  score: number;
  description: string;
}

export interface RouteSegment {
  start: Coordinates;
  end: Coordinates;
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
    profile: number[];
  };
  surface: string[];
  conditions: EnvironmentalConditions;
}

export interface RouteMetrics {
  totalDistance: number;
  totalDuration: number;
  elevation: {
    totalGain: number;
    totalLoss: number;
    maxAltitude: number;
    minAltitude: number;
    profile: number[];
  };
  segments: RouteSegment[];
  difficulty: 'easy' | 'moderate' | 'hard';
  surfaces: {
    type: string;
    percentage: number;
  }[];
} 