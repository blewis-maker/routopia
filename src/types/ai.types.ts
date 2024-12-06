import { GeoPoint, RouteConstraints } from './mcp.types';

export interface RouteGenerationRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints?: GeoPoint[];
  preferences: {
    activityType: 'WALK' | 'RUN' | 'BIKE';
    avoidHills?: boolean;
    preferScenic?: boolean;
    maxDistance?: number;
    accessibility?: {
      wheelchairAccessible?: boolean;
      avoidStairs?: boolean;
    };
    weatherAware?: boolean;
    includePointsOfInterest?: boolean;
    poiCategories?: string[];
  };
  constraints?: RouteConstraints & {
    arrivalTime?: string;
    poiStopDuration?: number;
    maxStops?: number;
    timeWindows?: Array<{
      type: string;
      preferredTime: string;
    }>;
    weatherConditions?: {
      avoidRain?: boolean;
      maxWindSpeed?: number;
    };
  };
}

export interface POIRequest {
  location: GeoPoint;
  radius: number;
  categories?: string[];
  filters?: {
    openNow?: boolean;
    rating?: number;
    priceLevel?: 'budget' | 'moderate' | 'expensive' | 'luxury';
    popularTimes?: {
      dayOfWeek: string;
      timeOfDay: string;
    };
  };
  timeConstraints?: {
    openAt?: string;
    minDuration?: number;
  };
  accessibility?: {
    wheelchairAccessible?: boolean;
    hasAccessibleParking?: boolean;
    hasAccessibleRestroom?: boolean;
  };
  amenities?: {
    wifi?: boolean;
    parking?: boolean;
    outdoorSeating?: boolean;
  };
  weatherAware?: boolean;
  limit?: number;
}

export interface ActivityRequest {
  type: 'WALK' | 'RUN' | 'BIKE';
  location: GeoPoint;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  preferences?: {
    terrain?: string[];
    scenery?: string[];
    timeOfDay?: string;
    weather?: {
      temperature?: {
        min?: number;
        max?: number;
      };
      conditions?: string[];
    };
  };
}

export interface EnvironmentalRequest {
  location: GeoPoint;
  time?: string;
  factors: Array<{
    type: 'weather' | 'terrain' | 'traffic' | 'safety' | 'lighting';
    importance: number;
  }>;
  constraints?: {
    minTemperature?: number;
    maxTemperature?: number;
    maxPrecipitation?: number;
    maxWindSpeed?: number;
    minVisibility?: number;
    daylight?: boolean;
  };
}

export interface AIMetricsData {
  requestCount: number;
  errorCount: number;
  latencyMs: number[];
  cacheHits: number;
  cacheMisses: number;
  tokenUsage: number;
  costEstimate: number;
  requestsByType: Record<string, number>;
  averageLatencyByType: Record<string, number>;
} 