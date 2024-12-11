import { LatLng } from '../shared';
import { UserProfile } from '../user';
import { WeatherConditions } from '../weather';

// Core Types
export interface RouteConstraints {
  startLocation: LatLng;
  endLocation?: LatLng;
  waypoints?: LatLng[];
  maxDistance?: number;
  avoidances?: string[];
}

export interface EnvironmentalFactors {
  weather: WeatherConditions;
  warnings?: string[];
  seasonality?: string[];
}

export interface UserPreferences {
  skill_level: string;
  maxDistance?: number;
  preferredTimes?: string[];
  equipment?: {
    bike?: BikeEquipment;
    ski?: SkiEquipment;
    run?: RunEquipment;
  };
}

// Base Activity Handler
export abstract class BaseActivity {
  abstract getPrompt(context: ActivityContext): Promise<string> | string;
  abstract getFollowUpQuestions(): string[];
  abstract validateContext(context: RoutePromptContext): boolean;
}

// OpenAI Function Types
export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface PromptTemplate {
  system: string;
  user: string;
  functions: OpenAIFunction[];
}

export type CoreActivityType = 'Drive' | 'Bike' | 'Run' | 'Ski' | 'Adventure';

export interface ActivityContext {
  activityType: CoreActivityType;
  preferences: UserPreferences;
  constraints: RouteConstraints;
  environmentalFactors: EnvironmentalFactors;
}

export interface RoutePromptContext {
  activity: ActivityContext;
  userProfile: UserProfile;
  timeOfDay: string;
}

export interface BikeEquipment {
  type: 'road' | 'mountain' | 'gravel' | 'hybrid' | 'ebike';
  style?: 'endurance' | 'race' | 'trail' | 'downhill' | 'cross-country';
  features?: string[];
}

export interface SkiEquipment {
  type: 'ski' | 'snowboard';
  style?: 'alpine' | 'nordic' | 'backcountry' | 'freestyle';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface RunEquipment {
  type: 'road' | 'trail';
  style?: 'endurance' | 'sprint' | 'ultrarun' | 'casual';
  terrain?: string[];
}

export type ActivityType = 
  | 'cycling'
  | 'running'
  | 'hiking'
  | 'walking'
  | 'swimming'
  | 'climbing'
  | 'skiing'
  | 'any';

export type ActivityStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paused';

export type ActivityDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface Activity {
  id: string;
  userId: string;
  provider: string;
  providerActivityId: string;
  type: ActivityType;
  name: string;
  description?: string;
  status: ActivityStatus;
  difficulty: ActivityDifficulty;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  distance?: number; // in meters
  elevation?: number; // in meters
  averageSpeed?: number; // in m/s
  maxSpeed?: number; // in m/s
  metrics?: Record<string, number | string>;
}

export interface ActivityProgress {
  activityId: string;
  userId: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  currentSpeed: number;
  elevation: number;
  heartRate?: number;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: ActivityType;
  criteria: {
    metric: string;
    value: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  };
  icon: string;
  points: number;
}

// Add to existing types
export interface ActivityProvider {
  name: string;
  supportedActivities: ActivityType[];
  initialize(): Promise<void>;
  isInitialized(): boolean;
  getActivities(userId: string): Promise<Activity[]>;
  syncActivities(userId: string): Promise<void>;
} 