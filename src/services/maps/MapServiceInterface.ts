import { LatLng } from '@/types/shared';
import { MapVisualization, RouteVisualizationSegment } from '@/types/maps/visualization';
import { TrafficData } from '@/types/maps/traffic';

export type UIActivityType = 'drive' | 'bike' | 'run' | 'ski' | 'adventure';
export type GoogleActivityType = 'car' | 'bike' | 'walk';

export interface MapServiceInterface {
  initialize(containerId: string, options?: any): Promise<void>;
  visualizeRoute(route: MapVisualization): Promise<void>;
  clearVisualization(): void;
  
  // Map state methods
  getCenter(): LatLng;
  getZoom(): number;
  getBounds(): MapBounds;
  
  // Marker management
  addMarker(coordinates: LatLng, options?: MarkerOptions): Promise<string>;
  removeMarker(markerId: string): void;
  updateMarker(markerId: string, coordinates: LatLng): void;
  
  // Traffic layer
  setTrafficLayer(visible: boolean): Promise<void>;
  getTrafficData(bounds: MapBounds): Promise<TrafficData>;
  
  // Utility methods
  fitBounds(bounds: MapBounds): void;
  panTo(coordinates: LatLng): void;
  
  // Add activity-related methods
  setActivityType(type: UIActivityType): void;
  getActivityType(): UIActivityType;
  convertActivityType(type: UIActivityType): GoogleActivityType;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarkerOptions {
  type?: 'start' | 'end' | 'waypoint' | 'poi';
  draggable?: boolean;
  icon?: string;
  onClick?: () => void;
  onDragEnd?: (coords: LatLng) => void;
}