export enum ActivityType {
  WALK = 'WALK',
  RUN = 'RUN',
  BIKE = 'BIKE',
  CAR = 'CAR',
  SKI = 'SKI'
}

export interface ActivityPreferences {
  difficulty: 'easy' | 'moderate' | 'hard';
  terrain: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
  weather: string[];
}

export interface ActivityConstraints {
  maxDistance?: number;
  maxDuration?: number;
  maxElevation?: number;
  requiredPOIs?: string[];
}

export interface ActivityMetrics {
  distance: number;
  duration: number;
  elevation: number;
  speed: number;
}

export interface ActivityStats {
  type: ActivityType;
  count: number;
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  lastActivity?: {
    date: string;
    metrics: ActivityMetrics;
  };
} 