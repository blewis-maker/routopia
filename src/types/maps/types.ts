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