export interface Location {
  coordinates: [number, number];
  address: string;
}

export interface Route {
  id: string;
  name: string;
  start: Location;
  end: Location;
  waypoints?: Location[];
  distance: number;
  duration: number;
  geometry: GeoJSON.LineString;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface SearchResult {
  id: string;
  name: string;
  coordinates: [number, number];
  type?: string;
  distance?: number;
} 