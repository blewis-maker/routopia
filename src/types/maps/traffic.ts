import { LatLng } from '../shared';

export interface TrafficData {
  congestionLevel: 'low' | 'moderate' | 'heavy';
  incidents?: string[];
  segments?: Array<{
    start: LatLng;
    end: LatLng;
    congestion: 'low' | 'moderate' | 'heavy';
    speed?: number;
    delay?: number;
  }>;
} 