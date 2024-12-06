export enum ActivityType {
  WALK = 'WALK',
  RUN = 'RUN',
  BIKE = 'BIKE',
  SKI = 'SKI',
  HIKE = 'HIKE',
  SWIM = 'SWIM',
  CAR = 'CAR'
}

export interface ActivityMetrics {
  speed: number;
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
    profile: number[];
  };
  calories: number;
  averageSpeed?: number;
  elevationGain?: number;
  difficulty?: number;
}

export interface UserPreferences {
  activityTypes: ActivityType[];
  preferredTimes: string[];
  difficultyPreference: string;
  weatherSensitivity: number;
  safetyPriority: number;
} 