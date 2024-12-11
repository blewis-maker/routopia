import { LatLng } from '../shared';
import { RouteSegmentType } from '../route/types';
import { TrafficData } from './traffic';

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

export interface MapVisualization {
  mainRoute: RouteVisualizationSegment;
  alternatives?: RouteVisualizationSegment[];
  distance: number;
  duration: number;
  waypoints?: {
    start: LatLng;
    end: LatLng;
    via?: LatLng[];
  };
  metadata?: {
    trafficLevel: 'low' | 'medium' | 'high';
    weatherConditions?: string[];
    recommendedTimes?: string[];
    warnings?: string[];
  };
} 