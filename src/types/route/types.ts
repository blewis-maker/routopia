import { ActivityType } from '../activities';
import { LatLng } from '../shared';
import { WeatherConditions } from '../weather';
import { UserProfile } from '../user';

export type RouteSegmentType = 'road' | 'trail' | 'ski' | 'connection';

export interface RouteSegment {
  type: RouteSegmentType;
  path: LatLng[];
  details: {
    distance: number;
    duration?: number;
    difficulty?: string;
    conditions?: string;
    color?: string;
    trailId?: string;
    resortId?: string;
  };
}

export interface RouteMetrics {
  distance: number;
  duration: number;
  elevation?: {
    gain: number;
    loss: number;
    max: number;
    min: number;
  };
}

export interface RouteMetadata {
  totalDistance: number;
  difficulty: string;
  conditions: string[];
  recommendations?: string[];
  terrain: string[];
  skillRequirements: {
    technical: string[];
    physical: string[];
    minimum: string;
    recommended: string;
  };
  dining: {
    preferences: {
      cuisineTypes: string[];
      priceRange: string[];
      dietaryRestrictions: string[];
    };
  };
  recreation: {
    preferences: {
      activityTypes: string[];
      intensity: string;
      duration: { min: number; max: number; };
    };
  };
  scheduling: {
    preferredStopFrequency: number;
    restStopDuration: number;
    recommendedTimes?: string[];
  };
  social: {
    groupSize?: number;
    familyFriendly: boolean;
    accessibility: string[];
  };
  equipment?: {
    required: string[];
    recommended: string[];
    optional: string[];
  };
  activityDetails?: {
    type: string;
    subType?: string;
    intensity: string;
    terrain: string[];
  };
  travelComfort?: {
    preferredStops: string[];
    avoidances: string[];
    restFrequency: number;
  };
}

export interface Route {
  id: string;
  name: string;
  type: RouteSegmentType;
  segments: RouteSegment[];
  metrics: RouteMetrics;
  waypoints: WaypointType[];
  metadata: RouteMetadata;
}

export interface WaypointType {
  type: 'parking' | 'trailhead' | 'resort' | 'destination';
  location: LatLng;
  name: string;
  details?: {
    parking?: boolean;
    facilities?: string[];
    hours?: string;
  };
}

export interface RoutePreferences {
  activityType: ActivityType;
  weights: {
    distance: number;
    duration: number;
    effort: number;
    safety: number;
    comfort: number;
  };
}