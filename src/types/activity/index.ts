export type ActivityType = 'WALK' | 'RUN' | 'BIKE' | 'SKI' | 'HIKE' | 'SWIM' | 'CAR';

export interface ActivityPreferences {
  type: ActivityType;
  intensity?: 'low' | 'moderate' | 'high';
  duration?: {
    min?: number; // minutes
    max?: number; // minutes
    preferred?: number; // minutes
  };
  distance?: {
    min?: number; // meters
    max?: number; // meters
    preferred?: number; // meters
  };
  terrain?: {
    maxSlope?: number; // percentage
    preferredSurface?: string[];
    avoidFeatures?: string[];
  };
  safety?: {
    minLighting?: number; // lux
    minVisibility?: number; // meters
    requireEmergencyServices?: boolean;
    avoidHighTraffic?: boolean;
  };
  comfort?: {
    maxTemperature?: number; // celsius
    minTemperature?: number; // celsius
    avoidPrecipitation?: boolean;
    maxWindSpeed?: number; // km/h
  };
  social?: {
    preferPopular?: boolean;
    avoidCrowds?: boolean;
    groupSize?: number;
  };
  schedule?: {
    preferredTimeOfDay?: string[];
    avoidPeakHours?: boolean;
    maxWaitTime?: number; // minutes
  };
  facilities?: {
    requireRestStops?: boolean;
    maxDistanceBetweenStops?: number; // meters
    requiredAmenities?: string[];
  };
}

export interface ActivityMetrics {
  duration: number;
  distance: number;
  averageSpeed: number;
  elevation: {
    gain: number;
    loss: number;
    current: number;
  };
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  pace: number;
  calories: number;
  heartRate?: {
    average: number;
    max: number;
    zones: {
      easy: number;
      moderate: number;
      hard: number;
      peak: number;
    };
  };
  cadence?: number;
  power?: number;
  temperature?: number;
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  terrain?: {
    type: string;
    difficulty: string;
    surface: string;
  };
  performance?: {
    effort: number;
    efficiency: number;
    consistency: number;
  };
}

export interface ActivitySummary {
  type: ActivityType;
  metrics: ActivityMetrics;
  achievements?: {
    name: string;
    description: string;
    value: number;
    unit: string;
  }[];
  recommendations?: {
    type: 'rest' | 'hydration' | 'safety' | 'equipment';
    message: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  nextMilestone?: {
    type: string;
    distance: number;
    estimate: number;
  };
} 