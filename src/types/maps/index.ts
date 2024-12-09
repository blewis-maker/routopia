export interface RouteVisualization {
  mainRoute: {
    coordinates: Array<{ lat: number; lng: number }>;
    distance?: number;
    duration?: number;
  };
  waypoints: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    via?: Array<{ lat: number; lng: number }>;
  };
  alternatives?: Array<{
    coordinates: Array<{ lat: number; lng: number }>;
    distance?: number;
    duration?: number;
  }>;
} 