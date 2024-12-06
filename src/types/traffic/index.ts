import { GeoPoint } from '../geo';

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'closure' | 'event';
  severity: 'low' | 'medium' | 'high';
  location: GeoPoint;
  description: string;
  estimatedDuration: number; // minutes
  impactRadius: number; // meters
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