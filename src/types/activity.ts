export enum ActivityType {
  CAR = 'CAR',
  BIKE = 'BIKE',
  WALK = 'WALK'
}

export const convertToRouteActivity = (activityType: ActivityType): 'car' | 'bike' | 'walk' => {
  switch (activityType) {
    case ActivityType.CAR:
      return 'car';
    case ActivityType.BIKE:
      return 'bike';
    case ActivityType.WALK:
      return 'walk';
    default:
      return 'car';
  }
};

export const isRoutingSupported = (activityType: ActivityType): boolean => {
  return [ActivityType.CAR, ActivityType.BIKE, ActivityType.WALK].includes(activityType);
};

export type ActivityStats = {
  type: ActivityType;
  count: number;
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  lastActivity?: {
    date: string;
    metrics: ActivityMetrics;
  };
};

export type ActivityMetrics = {
  distance: number;
  duration: number;
  speed: number;
  calories: number;
  elevation?: number;
  heartRate?: {
    average: number;
    max: number;
  };
  cadence?: number;
  power?: number;
};

export interface ActivityPreferences {
  type: ActivityType;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number; // in minutes
  distance?: number; // in meters
  elevation?: {
    maxGain?: number;
    maxLoss?: number;
  };
  terrain?: {
    difficulty?: 'easy' | 'moderate' | 'difficult';
    surface?: string[];
  };
  weather?: {
    minTemp?: number;
    maxTemp?: number;
    avoidPrecipitation?: boolean;
    windThreshold?: number;
  };
}

export type ActivityFilters = {
  type?: ActivityType;
  startDate?: Date;
  endDate?: Date;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
};

export type ActivitySortField = 'date' | 'distance' | 'duration' | 'speed' | 'calories';
export type SortOrder = 'asc' | 'desc';

export type ActivitySort = {
  field: ActivitySortField;
  order: SortOrder;
}; 