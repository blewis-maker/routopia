import type { Map, LngLatLike } from 'mapbox-gl';

export type ActivityType = 'car' | 'bike' | 'walk' | 'ski';

export interface DrawingPoint {
  coordinates: [number, number];
  timestamp: number;
}

export interface RouteDrawingProps {
  activityType: ActivityType;
  isDrawing: boolean;
  onDrawComplete: (points: [number, number][]) => void;
  onDrawCancel: () => void;
  mapInstance?: Map;
  className?: string;
  onDrawProgress?: (progress: number) => void;
  enableUndo?: boolean;
  snapToRoads?: boolean;
}

export interface SavedRoute {
  id: string;
  name: string;
  activityType: string;
  distance: number;
  duration: number;
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
  waypoints?: Array<{
    lat: number;
    lng: number;
    address: string;
  }>;
  activities: Array<{
    type: string;
    duration: number;
    distance: number;
  }>;
  status: RouteStatus;
  lastChecked: Date;
}

export interface RouteStatus {
  id: string;
  timestamp: Date;
  conditions: {
    weather?: {
      temperature: number;
      conditions: string;
      alerts?: string[];
    };
    trail?: {
      status: 'open' | 'closed' | 'warning';
      conditions: string;
    };
    traffic?: {
      level: 'low' | 'moderate' | 'heavy';
      incidents: string[];
    };
  };
}

export type AlertType = 'weather' | 'trail' | 'traffic' | 'schedule' | 'recommendation'; 