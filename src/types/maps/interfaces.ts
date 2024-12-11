import { Map } from 'mapbox-gl';

export interface MapServiceInterface {
  setMapInstance(map: Map): void;
  getMap(): Map | null;
  drawRoute(route: RouteVisualization): Promise<void>;
  addMarker(coordinates: Coordinates, options?: MarkerOptions): Promise<string>;
  removeMarker(markerId: string): void;
  clearRoute(): void;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MarkerOptions {
  type?: 'start' | 'end' | 'waypoint';
  title?: string;
  onClick?: () => void;
  draggable?: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
} 