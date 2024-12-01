export interface ElevationData {
  distance: number;
  elevation: number;
  grade: number;
  coordinates: [number, number];
}

export interface TrafficData {
  segments: TrafficSegment[];
  delay: number;
  totalDistance: number;
  timestamp: number;
}

export interface TrafficSegment {
  startIndex: number;
  endIndex: number;
  level: 'low' | 'moderate' | 'heavy';
  distance: number;
  speed: number;
}

export type ActivityType = 'car' | 'bike' | 'walk' | 'ski';

export interface RouteData {
  waypoints: Waypoint[];
  distance: number;
  duration: number;
  elevation: ElevationData[];
  traffic?: TrafficData;
  geometry: [number, number][];
}

export interface Waypoint {
  id: string;
  position: [number, number];
  type: 'start' | 'end' | 'via';
  name: string;
} 