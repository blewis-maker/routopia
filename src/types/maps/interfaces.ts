import { Map } from 'mapbox-gl';

export interface MapServiceInterface {
  setMapInstance(map: Map): void;
  getMap(): Map | null;
  drawRoute(route: RouteVisualization): Promise<void>;
  addMarker(coordinates: Coordinates, options?: MarkerOptions): Promise<string>;
  removeMarker(markerId: string): void;
  clearRoute(): void;
  generateRoute(start: Coordinates, end: Coordinates, waypoints?: Coordinates[]): Promise<RouteVisualization>;
  addUserLocationMarker(coordinates: Coordinates): Promise<void>;
  isReady(): boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MarkerOptions {
  type?: 'start' | 'end' | 'waypoint';
  title?: string;
  draggable?: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RouteVisualization {
  coordinates: Coordinates[];
  distance: number;
  duration: number;
  bounds: MapBounds;
} 