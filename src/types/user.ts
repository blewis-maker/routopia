import { WeatherConditions } from './weather';
import { ActivityPreferences } from './activities';

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
  
  // Activity preferences
  defaultActivity?: string;
  skillLevel?: string;
  maxDistance?: number;
  preferredTimes?: string[];
  weatherPrefs?: {
    minTemp?: number;
    maxTemp?: number;
    avoidRain?: boolean;
    avoidSnow?: boolean;
    preferredConditions?: string[];
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RouteHistory {
  id?: string;
  userId: string;
  startPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  endPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  activityType: string;
  distance: number;
  duration: number;
  weather?: {
    temperature: number;
    conditions: string;
    windSpeed: number;
  };
  rating?: number;
  timestamp?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  preferences: {
    activities: ActivityPreferences;
    weather: {
      preferred: Partial<WeatherConditions>;
      avoid: Partial<WeatherConditions>;
    };
    notifications: {
      email: boolean;
      push: boolean;
      frequency: 'realtime' | 'daily' | 'weekly';
    };
    accessibility: {
      requirements: string[];
      preferences: string[];
    };
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    units: 'metric' | 'imperial';
    language: string;
    timezone: string;
  };
} 