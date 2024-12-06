import { ActivityType } from '@/types/activity';

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type RouteContext = {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: RoutePreferences;
};

export type RoutePreferences = {
  activityType: ActivityType;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  maxElevation?: number;
  maxDistance?: number;
  maxDuration?: number;
  requiredPOIs?: string[];
};

export type POIRecommendation = {
  name: string;
  location: GeoPoint;
  type: string;
  rating?: number;
  distance?: number;
  openNow?: boolean;
};

export type WeatherConditions = {
  temperature: number;
  conditions: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
};

export type MCPResponse = {
  route?: {
    points: GeoPoint[];
    distance: number;
    duration: number;
    elevation: number;
  };
  pois?: POIRecommendation[];
  weather?: WeatherConditions;
  error?: string;
}; 