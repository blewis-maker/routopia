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