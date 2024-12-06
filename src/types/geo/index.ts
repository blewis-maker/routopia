export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoBox {
  northeast: GeoPoint;
  southwest: GeoPoint;
}

export interface GeoDistance {
  value: number; // meters
  text: string;
}

export interface GeoDuration {
  value: number; // seconds
  text: string;
} 