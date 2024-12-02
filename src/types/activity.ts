export type ActivityType = 'car' | 'bike' | 'walk' | 'ski';

export interface ActivityPreferences {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  preferScenic?: boolean;
  maxDistance?: number;
  maxDuration?: number;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

export interface ActivityConstraints {
  timeConstraints?: {
    startTime?: Date;
    endTime?: Date;
    maxDuration?: number;
  };
  locationConstraints?: {
    startPoint?: [number, number];
    endPoint?: [number, number];
    waypoints?: [number, number][];
  };
  routeConstraints?: {
    maxElevation?: number;
    maxGradient?: number;
    surfaceType?: string[];
  };
}

export interface Activity {
  id: string;
  type: ActivityType;
  preferences: ActivityPreferences;
  constraints: ActivityConstraints;
  timestamp: Date;
} 