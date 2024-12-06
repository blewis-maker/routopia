import { GeoPoint } from '../geo';

export interface TrafficConditions {
  timestamp: Date;
  level: number;  // 0-1 scale
  speed: number;  // km/h
  density: number;  // vehicles per km
  confidence: number;  // 0-1 scale
}

export interface TrafficPattern {
  id: string;
  dayOfWeek: number;  // 0-6
  hourRange: {
    start: number;  // 0-23
    end: number;  // 0-23
  };
  baseLevel: number;
  baseSpeed: number;
  baseDensity: number;
  confidence: number;
  seasonalFactors: {
    winter: number;
    spring: number;
    summer: number;
    fall: number;
  };
  weatherFactors: {
    rain: number;
    snow: number;
    fog: number;
    wind: number;
  };
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'event' | 'hazard';
  location: GeoPoint;
  severity: number;  // 1-5
  startTime: Date;
  estimatedEndTime: Date;
  impactRadius: number;  // meters
  description: string;
}

export interface TrafficUpdate {
  timestamp: Date;
  location: GeoPoint;
  conditions: TrafficConditions;
  incidents: TrafficIncident[];
  predictions: Array<{
    timestamp: Date;
    conditions: TrafficConditions;
  }>;
}

export interface CongestionZone {
  center: GeoPoint;
  radius: number;
  level: number;
  type: 'recurring' | 'incident' | 'event';
  duration: {
    start: Date;
    end: Date;
  };
  impact: {
    speed: number;
    delay: number;
  };
}

export interface TrafficTrend {
  period: {
    start: Date;
    end: Date;
  };
  direction: 'improving' | 'stable' | 'worsening';
  rate: number;
  confidence: number;
  factors: Array<{
    type: string;
    impact: number;
  }>;
}

export interface TrafficAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  location: GeoPoint;
  timestamp: Date;
  description: string;
  recommendations: string[];
  expiresAt: Date;
} 