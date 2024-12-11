import { Activity, ActivityType, ActivityStatus } from '@/types/activities/activityTypes';
import { UserProfile } from '@/types/user';
import { WeatherConditions } from '@/types/weather';
import { Route } from '@/types/route/types';

export interface ActivityProvider {
  name: string;
  supportedActivities: ActivityType[];
  
  initialize(): Promise<void>;
  isInitialized(): boolean;
  
  getActivities(userId: string): Promise<Activity[]>;
  syncActivities(userId: string): Promise<void>;
  trackActivity(userId: string, activity: Activity): Promise<void>;
}

export interface ActivityRecommender {
  getRecommendations(
    user: UserProfile,
    weather: WeatherConditions,
    route?: Route
  ): Promise<Activity[]>;
  
  getRating(activity: Activity, conditions: WeatherConditions): number;
}

export interface ActivityTracker {
  startActivity(userId: string, activity: Activity): Promise<void>;
  updateActivity(userId: string, activity: Activity): Promise<void>;
  endActivity(userId: string, activity: Activity): Promise<void>;
  getStatus(userId: string, activityId: string): Promise<ActivityStatus>;
} 