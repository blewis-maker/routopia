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

export type CoreActivityType = 'Drive' | 'Bike' | 'Run' | 'Ski' | 'Adventure';

export type SubActivityType = 'foodie' | 'family' | 'training' | 'photography';
export type TransitMode = 'car' | 'public_transit' | 'self_powered';

export interface SubActivityParameters {
  foodie?: {
    cuisineTypes: string[];
    photoOpportunities?: boolean;
    priceRange?: string;
  };
  family?: {
    childrenAges?: number[];
    safetyPriority: 'low' | 'medium' | 'high';
    requiresRestrooms?: boolean;
  };
  training?: {
    intensity: 'low' | 'medium' | 'high';
    duration: number;
    preferredTerrain?: string[];
  };
  photography?: {
    subjects: string[];
    timeOfDay?: string[];
    requiresParking?: boolean;
  };
}

export interface WeatherConditions {
  temperature: number;
  conditions: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
}

export interface TrafficConditions {
  congestionLevel: 'low' | 'medium' | 'high';
  incidents?: string[];
  roadClosures?: string[];
}

export interface LocalEvent {
  name: string;
  type: string;
  location: LatLng;
  startTime: string;
  endTime: string;
  impact: 'low' | 'medium' | 'high';
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UserProfile {
  preferences: {
    preferred_activities: string[];
    cuisine_preferences?: string[];
    skill_level: 'beginner' | 'intermediate' | 'advanced';
    max_distance?: number;
    preferred_times?: string[];
  };
  history?: {
    recent_routes: string[];
    favorite_places: string[];
    avoided_areas?: string[];
  };
}

export interface RouteConstraints {
  startLocation: LatLng;
  endLocation?: LatLng;
  waypoints?: LatLng[];
  maxDistance?: number;
  avoidances?: string[];
  timeConstraints?: {
    departureTime?: string;
    arrivalTime?: string;
    maxDuration?: number;
  };
}

export interface PromptTemplate {
  system: string;
  user: string;
  functions: OpenAIFunction[];
}

export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
  };
}

// ... existing code ... 