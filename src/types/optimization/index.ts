import { WeatherConditions } from '../weather';
import { TerrainConditions } from '../route';
import { TrafficAnalysis } from '../traffic';
import { SocialFactors } from '../social';
import { SeasonalConditions } from '../weather';
import { FacilityStatus } from '../facility';

export interface OptimizationFactors {
  weather: WeatherConditions;
  terrain: TerrainConditions;
  traffic: TrafficAnalysis;
  social: SocialFactors;
  seasonal: SeasonalConditions;
  facilities?: FacilityStatus[];
}

export interface OptimizationMetrics {
  safetyScore: number;
  comfortScore: number;
  trafficScore: number;
  facilityScore: number;
  socialScore: number;
}

export interface OptimizationAlert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  action?: 'info' | 'reroute' | 'wait';
  details?: Record<string, unknown>;
} 