export enum ActivityType {
  BIKE = 'BIKE',
  RUN = 'RUN',
  WALK = 'WALK',
  HIKE = 'HIKE',
  SKI = 'SKI',
  SWIM = 'SWIM',
  CAR = 'CAR',
}

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

export type ActivityPreferences = {
  preferredUnits: 'metric' | 'imperial';
  defaultActivityType: ActivityType;
  showHeartRate: boolean;
  showPower: boolean;
  showCadence: boolean;
  showElevation: boolean;
  showWeather: boolean;
  autoStart: boolean;
  autoPause: boolean;
};

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