export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapServiceInterface {
  initialize(containerId: string): Promise<void>;
  setCenter(coordinates: Coordinates): void;
  setZoom(level: number): void;
  getBounds(): MapBounds;
  addMarker(coordinates: Coordinates): void;
  removeMarker(markerId: string): void;
  drawRoute(coordinates: Coordinates[]): void;
  clearRoute(): void;
  
  // Optional methods with default implementations
  setTrafficLayer?(visible: boolean): void;
  showAlternativeRoutes?(coordinates: Coordinates[]): void;
} 