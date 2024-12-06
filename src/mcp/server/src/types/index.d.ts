declare module 'activities' {
  export interface Activity {
    type: ActivityType;
    duration: number;
    distance: number;
    elevation?: number;
    conditions?: WeatherConditions;
  }

  export interface ActivityPreferences {
    avoidHills?: boolean;
    preferScenic?: boolean;
    maxDistance?: number;
    activityType: ActivityType;
    timeConstraints?: TimeConstraints;
    weatherPreferences?: WeatherPreferences;
  }

  export type ActivityType = 
    | 'WALK' 
    | 'RUN' 
    | 'BIKE'
    | 'CAR'
    | 'SKI'
    | 'HIKE'
    | 'PHOTO'
    | 'FOOD'
    | 'TEAM'
    | 'TRAINING'
    | 'SIGHTSEEING'
    | 'SHOPPING';

  export interface TimeConstraints {
    departureTime?: string;
    arrivalTime?: string;
    maxDuration?: number;
  }

  export interface WeatherPreferences {
    minTemperature?: number;
    maxTemperature?: number;
    maxWindSpeed?: number;
    acceptablePrecipitation?: ('none' | 'light' | 'moderate')[];
  }
}

declare module 'components' {
  export interface RouteComponent {
    type: 'segment' | 'waypoint' | 'poi';
    location: GeoPoint;
    name?: string;
    description?: string;
  }

  export interface RouteSegment extends RouteComponent {
    type: 'segment';
    distance: number;
    duration: number;
    elevation?: number;
    activityType: ActivityType;
    segmentType: 'MAIN' | 'TRIBUTARY';
    conditions: {
      weather: WeatherConditions;
      surface: string[];
      difficulty: 'easy' | 'moderate' | 'hard';
      safety: 'low' | 'moderate' | 'high';
    };
    bailoutPoints?: GeoPoint[];
  }

  export interface Waypoint extends RouteComponent {
    type: 'waypoint';
    arrivalTime?: string;
    departureTime?: string;
    conditions?: WeatherConditions;
  }

  export interface POI extends RouteComponent {
    type: 'poi';
    category: string;
    rating?: number;
    openingHours?: string;
    weatherSensitive: boolean;
    activityTypes: ActivityType[];
  }

  export interface GeoPoint {
    lat: number;
    lng: number;
  }

  export interface WeatherConditions {
    temperature: number;
    windSpeed: number;
    precipitation: {
      type: 'none' | 'rain' | 'snow';
      intensity: 'none' | 'light' | 'moderate' | 'heavy';
    };
    visibility: number;
    snowDepth?: number;
    avalancheRisk?: 'low' | 'moderate' | 'high';
  }
}

declare module 'services' {
  export interface MCPConfig {
    aiModel: string;
    maxTokens: number;
    temperature: number;
    cacheEnabled: boolean;
    metricsEnabled: boolean;
  }

  export interface POIServiceConfig {
    provider: 'google' | 'openstreetmap';
    apiKey?: string;
    cacheEnabled: boolean;
    maxRadius: number;
  }

  export interface WeatherServiceConfig {
    provider: 'openweathermap' | 'weatherapi';
    apiKey: string;
    updateInterval: number;
    cacheEnabled: boolean;
  }
}