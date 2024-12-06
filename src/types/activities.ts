export enum ActivityType {
  WALK = 'WALK',
  RUN = 'RUN',
  BIKE = 'BIKE',
  CAR = 'CAR',
  SKI = 'SKI',
  HIKE = 'HIKE',
  SWIM = 'SWIM',
  STRENGTH = 'STRENGTH',
  YOGA = 'YOGA'
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
  id?: string;
  distance: number;
  duration: number; // In seconds
  speed: number;
  calories: number;
  elevation?: number;
  heartRate?: {
    average: number;
    max: number;
  };
  cadence?: number;
  power?: number;
  swimPace?: number;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface TrainingPlan {
  id?: string;
  name: string;
  type: ActivityType;
  startDate: string;
  endDate: string;
  goal: string;
  workouts: Workout[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Workout {
  id?: string;
  type: ActivityType;
  scheduledDate: string;
  targetMetrics: ActivityMetrics;
  actualMetrics?: ActivityMetrics;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActivityPerformanceTrends {
  type: ActivityType;
  metrics: {
    [key: string]: {
      baseline: number;
      currentAverage: number;
      delta: number;
      deltaPercentage: number;
    }
  };
}

// ... existing code ... 