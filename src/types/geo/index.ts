export interface GeoPoint {
  latitude: number;
  longitude: number;
  elevation?: number;
  accuracy?: number;
}

export interface GeoArea {
  center: GeoPoint;
  radius: number;
  type?: 'circle' | 'polygon';
}

export interface GeoBounds {
  northeast: GeoPoint;
  southwest: GeoPoint;
}

export type GeoDistance = {
  value: number;
  unit: 'meters' | 'kilometers' | 'miles';
}

export interface GeoRoute {
  points: GeoPoint[];
  distance: GeoDistance;
  bounds: GeoBounds;
} 