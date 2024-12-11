import { LatLng } from '../shared';
import { RouteSegmentType } from './types';
import { TrafficData } from '../maps/traffic';

export interface RouteVisualizationBase {
  distance: number;
  duration: number;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface RouteVisualizationSegment {
  coordinates: LatLng[];
  type: RouteSegmentType;
  trafficData?: TrafficData;
  details?: {
    distance: number;
    duration: number;
    difficulty?: string;
    elevation?: {
      gain: number;
      loss: number;
    };
  };
}

export interface RouteVisualization extends RouteVisualizationBase {
  mainRoute: RouteVisualizationSegment;
  alternatives?: RouteVisualizationSegment[];
  waypoints?: {
    start: LatLng;
    end: LatLng;
    via?: LatLng[];
  };
  metadata?: {
    trafficLevel?: 'low' | 'moderate' | 'heavy';
    weatherConditions?: string[];
    recommendedTimes?: string[];
    warnings?: string[];
  };
}

export interface RouteVisualizationResponse {
  mainRoute: RouteVisualization;
  alternatives?: RouteVisualization[];
}

// Type guard for visualization types
export function isRouteVisualization(obj: any): obj is RouteVisualization {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'mainRoute' in obj &&
    'distance' in obj &&
    'duration' in obj &&
    Array.isArray(obj.mainRoute.coordinates) &&
    obj.mainRoute.coordinates.every((coord: any) => 
      'lat' in coord && 'lng' in coord
    )
  );
}

// Add LegacyRouteVisualization type
export interface LegacyRouteVisualization {
  coordinates: [number, number][];
  distance?: number;
  duration?: number;
  alternatives?: Array<{
    coordinates: [number, number][];
    distance: number;
    duration: number;
  }>;
} 