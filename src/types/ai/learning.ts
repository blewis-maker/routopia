import { ActivityType, ActivityMetrics } from '@/types/activity';
import { WeatherConditions } from '@/types/weather';
import { TerrainConditions } from '@/types/route/types';
import { SocialFactors } from '@/types/social';
import { GeoPoint } from '@/types/geo';

export type PatternType = 
  | 'performance'
  | 'weather'
  | 'social'
  | 'cross_activity'
  | 'seasonal_activity'
  | 'seasonal_weather'
  | 'terrain_preference'
  | 'environmental_impact'
  | 'group_interaction'
  | 'group_performance'
  | 'activity_popularity'
  | 'community_influence'
  | 'time_preference';

export interface LearningPattern {
  type: PatternType;
  confidence: number;
  pattern: Record<string, any>;
  relatedActivities?: ActivityType[];
}

export interface UserBehavior {
  userId: string;
  activityType: ActivityType;
  metrics: ActivityMetrics;
  location: GeoPoint;
  timestamp: number;
  weather?: WeatherConditions;
  terrain?: TerrainConditions;
  social?: SocialFactors;
}

export interface UserPreferences {
  preferredActivities: ActivityType[];
  preferredTimes: {
    startHour: number;
    endHour: number;
    days: number[];
  };
  weatherPreferences: {
    temperatureRange: [number, number];
    conditions: string[];
  };
  socialPreferences: {
    groupSize: number;
    communityEngagement: boolean;
    privacySettings: {
      shareActivity: boolean;
      shareLocation: boolean;
      shareStats: boolean;
    };
  };
}

export interface AIServiceConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  endpoint: string;
}

export interface LearningContext {
  weather: WeatherConditions;
  terrain: TerrainConditions;
  social: SocialFactors;
  location: GeoPoint;
  timestamp: number;
}

export interface ActivityPattern {
  type: ActivityType;
  frequency: number;
  performance: {
    averageSpeed: number;
    averageDuration: number;
    averageDistance: number;
    elevation: {
      gain: number;
      loss: number;
    };
  };
  preferences: {
    timeOfDay: string[];
    weather: string[];
    terrain: string[];
    social: string[];
  };
}

export interface RouteContext {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints: GeoPoint[];
  constraints: {
    maxDistance?: number;
    maxDuration?: number;
    maxElevation?: number;
    avoidFeatures?: string[];
    preferFeatures?: string[];
  };
  preferences: UserPreferences;
  currentConditions: {
    weather: WeatherConditions;
    traffic: any;
    social: SocialFactors;
  };
} 