export type ActivityType =
  | 'hiking'
  | 'trail-running'
  | 'road-running'
  | 'road-cycling'
  | 'mountain-biking'
  | 'gravel-cycling'
  | 'alpine-skiing'
  | 'cross-country-skiing'
  | 'snowboarding'
  | 'rock-climbing'
  | 'urban-walking'
  | 'trail-walking';

export interface ActivityDetails {
  type: ActivityType;
  metrics: {
    speed: {
      min: number;
      max: number;
      average: number;
      unit: 'km/h' | 'mph';
    };
    elevation: {
      minGain: number;
      maxGain: number;
      preferredGain: number;
      unit: 'm' | 'ft';
    };
    duration: {
      min: number;
      max: number;
      preferred: number;
      unit: 'minutes' | 'hours';
    };
  };
  requirements: {
    fitness: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    technical: 'low' | 'medium' | 'high';
    equipment: string[];
    season: ('spring' | 'summer' | 'fall' | 'winter')[];
  };
  constraints: {
    weather: {
      maxWind: number;
      maxTemp: number;
      minTemp: number;
      conditions: string[];
    };
    daylight: {
      required: boolean;
      minimumHours?: number;
    };
  };
} 