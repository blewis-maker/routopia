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

export interface TrafficOptions {
  showRealTime: boolean;
  showIncidents: boolean;
  showAlternatives: boolean;
}

export interface RouteOptions {
  activityType: 'car' | 'bike' | 'walk';
  showTraffic?: boolean;
  showAlternatives?: boolean;
  isInteractive?: boolean;
  style?: {
    color?: string;
    width?: number;
    opacity?: number;
  };
}

export interface RouteVisualization {
  mainRoute: {
    coordinates: Coordinates[];
    trafficData?: TrafficData;
    distance?: number;
    duration?: number;
  };
  alternatives?: Array<{
    coordinates: Coordinates[];
    duration: number;
    distance: number;
  }>;
  waypoints?: {
    start: Coordinates;
    end: Coordinates;
    via: Coordinates[];
  };
}

export interface TrafficData {
  congestionLevel: 'low' | 'medium' | 'high';
  incidents: Array<{
    type: string;
    description: string;
    location: Coordinates;
    severity: 'low' | 'medium' | 'high';
    startTime?: Date;
    endTime?: Date;
  }>;
  segments?: Array<{
    start: Coordinates;
    end: Coordinates;
    congestion: 'low' | 'medium' | 'high';
    speed?: number;
    delay?: number;
  }>;
}

export interface MapServiceInterface {
  // Core initialization
  initialize(containerId: string, options?: {
    style?: string;
    center?: Coordinates;
    zoom?: number;
    attributionControl?: boolean;
    preserveDrawingBuffer?: boolean;
  }): Promise<void>;

  // Basic map controls
  setCenter(coordinates: Coordinates): void;
  setZoom(level: number): void;
  getBounds(): MapBounds;
  getCenter(): Coordinates;
  getZoom(): number;
  
  // Marker management
  addMarker(coordinates: Coordinates, options?: {
    type?: 'start' | 'end' | 'waypoint';
    draggable?: boolean;
    icon?: string;
    onClick?: () => void;
    onDragEnd?: (coords: Coordinates) => void;
  }): string;
  removeMarker(markerId: string): void;
  updateMarker(markerId: string, coordinates: Coordinates): void;

  // Enhanced route visualization
  drawRoute(
    route: RouteVisualization,
    options: RouteOptions
  ): Promise<void>;
  
  clearRoute(): void;
  
  // Traffic layer management
  setTrafficLayer(visible: boolean, options?: TrafficOptions): Promise<void>;
  getTrafficData(bounds: MapBounds): Promise<TrafficData>;
  
  // Route alternatives
  showAlternativeRoutes(routes: RouteVisualization['alternatives']): void;
  hideAlternativeRoutes(): void;

  // UI Controls
  addControls(options: {
    navigation?: boolean;
    geolocate?: boolean;
    scale?: boolean;
    fullscreen?: boolean;
  }): void;

  // Event handlers
  on(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void;
  off(event: 'click' | 'move' | 'zoom' | 'dragend', callback: (e: any) => void): void;

  // Utility methods
  fitBounds(bounds: MapBounds, options?: { padding?: number }): void;
  panTo(coordinates: Coordinates, options?: { duration?: number }): void;
  
  // Layer management
  addLayer(layerId: string, options: any): void;
  removeLayer(layerId: string): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
}

export interface RouteSegment {
  startPoint: {
    latitude: number;
    longitude: number;
  };
  endPoint: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: number;
}