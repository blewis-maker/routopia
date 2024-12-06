export enum ActivityType {
  WALK = 'WALK',
  RUN = 'RUN',
  BIKE = 'BIKE',
  SKI = 'SKI',
  HIKE = 'HIKE',
  SWIM = 'SWIM',
  CAR = 'CAR'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface BaseActivityMetrics {
  speed: number;
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
    profile: number[];
    currentElevation: number;
  };
  calories: number;
  pace: number;
  timestamp: string;
  weather?: {
    temperature: number;
    conditions: string;
    windSpeed: number;
  };
  terrain?: {
    type: string;
    difficulty: DifficultyLevel;
    surface: string;
  };
}

export interface BikeMetrics extends BaseActivityMetrics {
  cadence: number;
  power?: number;
  gearRatio?: number;
  bikeLaneCoverage: number;
  trafficDensity?: number;
}

export interface SkiMetrics extends BaseActivityMetrics {
  snowDepth: number;
  snowQuality: string;
  trailCondition: string;
  groomed: boolean;
  avalancheRisk?: number;
}

export interface RunMetrics extends BaseActivityMetrics {
  cadence: number;
  strideLength: number;
  groundContactTime?: number;
  verticalOscillation?: number;
}

export interface WalkMetrics extends BaseActivityMetrics {
  stepCount: number;
  terrainType: string;
  restStops?: number;
}

export interface CarMetrics extends BaseActivityMetrics {
  fuelEfficiency?: number;
  trafficDelay: number;
  stopCount: number;
  alternativeRoutes: number;
}

export type ActivityMetrics = 
  | (BaseActivityMetrics & { type: 'BASE' })
  | (BikeMetrics & { type: 'BIKE' })
  | (SkiMetrics & { type: 'SKI' })
  | (RunMetrics & { type: 'RUN' })
  | (WalkMetrics & { type: 'WALK' })
  | (CarMetrics & { type: 'CAR' });

export interface ActivitySegment {
  type: ActivityType;
  metrics: ActivityMetrics;
  startPoint: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  endPoint: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  waypoints?: Array<{
    lat: number;
    lng: number;
    elevation?: number;
    type: 'rest' | 'transition' | 'poi' | 'checkpoint';
  }>;
}

export interface MultiSegmentActivity {
  id: string;
  segments: ActivitySegment[];
  totalMetrics: {
    distance: number;
    duration: number;
    elevation: {
      gain: number;
      loss: number;
    };
    calories: number;
  };
  transitions: Array<{
    fromType: ActivityType;
    toType: ActivityType;
    point: {
      lat: number;
      lng: number;
      elevation?: number;
    };
    duration: number;
  }>;
}

export interface UserPreferences {
  activityTypes: ActivityType[];
  preferredTimes: string[];
  difficultyPreference: DifficultyLevel;
  weatherSensitivity: number;
  safetyPriority: number;
  terrainPreferences: {
    [key in ActivityType]?: {
      preferred: string[];
      avoided: string[];
    };
  };
  transitionPreferences?: {
    maxTransitionTime: number;
    preferredTransitionPoints?: string[];
  };
} 