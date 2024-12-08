import { ActivityType } from '../activity';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  distance: number;
  duration: number;
  elevation?: {
    start: number;
    end: number;
    gain: number;
    loss: number;
  };
}

export interface RouteMetrics {
  distance: number;  // in meters
  duration: number;  // in seconds
  elevation?: {
    gain: number;
    loss: number;
    max: number;
    min: number;
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

export interface Route {
  id: string;
  name: string;
  segments: RouteSegment[];
  totalMetrics?: RouteMetrics;
  preferences: RoutePreferences;
}