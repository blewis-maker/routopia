import { LatLng } from '../shared';
import { GeoPoint } from '../geo';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TrafficData {
  timestamp: Date;
  congestionLevel: 'low' | 'moderate' | 'high';
  averageSpeed: number;
  incidents: TrafficIncident[];
  segments: TrafficSegment[];
}

export interface TrafficSegment {
  start: LatLng;
  end: LatLng;
  congestionLevel: 'low' | 'moderate' | 'high';
  speed: number;
  duration: number;
  length: number;
  confidence: number;
}

export interface TrafficFlow {
  location: LatLng;
  timestamp: Date;
  speed: number;
  density: number;
  direction: number;
  confidence: number;
  history?: Array<{
    timestamp: Date;
    speed: number;
    density: number;
  }>;
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'closure' | 'event';
  location: LatLng;
  description: string;
  severity: 'low' | 'moderate' | 'high';
  startTime: Date;
  endTime?: Date;
  impact: {
    radius: number;
    affectedRoads: string[];
    delay: number;
  };
}

export interface TrafficPattern {
  dayOfWeek: number;
  hourOfDay: number;
  averageSpeed: number;
  congestionProbability: number;
  confidence: number;
  historicalData: Array<{
    timestamp: Date;
    speed: number;
    congestion: 'low' | 'moderate' | 'high';
  }>;
}

export interface TrafficAnalysis {
  congestionLevels: number[];
  incidents: TrafficIncident[];
  historicalComparison: 'better' | 'normal' | 'worse';
  predictions: {
    nextHour: number;
    nextDay: number[];
  };
}

export interface TrafficPrediction {
  location: LatLng;
  predictions: Array<{
    hour: number;
    speed: number;
    congestion: 'low' | 'moderate' | 'high';
    confidence: number;
  }>;
  trends: {
    congestion: ('low' | 'moderate' | 'high')[];
    speeds: number[];
    reliability: number;
  };
  reliability: number;
  timestamp: Date;
} 