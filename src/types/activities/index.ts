import { LatLng } from '../shared';
import { UserProfile } from '../user';
import { WeatherConditions } from '../weather';

// Core Activity Types
export type CoreActivityType = 'Drive' | 'Bike' | 'Run' | 'Ski' | 'Adventure';

// Re-export equipment types
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

// Context Types
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

// Re-export everything from activityTypes
export * from './activityTypes'; 