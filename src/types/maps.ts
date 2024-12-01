export type ActivityType = 'car' | 'bike' | 'ski' | 'walk';

export interface MapStyle {
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: number[];
}

export interface RouteVisualizationOptions {
  activityType: ActivityType;
  showTraffic: boolean;
  showAlternatives: boolean;
  style?: MapStyle;
}

export interface TrafficSegment {
  start: [number, number];
  end: [number, number];
  congestion: 'low' | 'moderate' | 'heavy';
  speed?: number;
}

export interface TrafficIncident {
  location: [number, number];
  type: string;
  severity: 'low' | 'moderate' | 'severe';
  description?: string;
}

export interface RouteVisualizationData {
  path: [number, number][];
  traffic?: {
    segments: TrafficSegment[];
    incidents: TrafficIncident[];
  };
  alternatives?: Array<{
    path: [number, number][];
    duration: number;
    distance: number;
  }>;
}
