import type { WeatherConditions, TrailConditions } from './services';

export interface MetricPoint {
  value: number;
  timestamp: number;
}

export interface MetricData {
  points: MetricPoint[];
  unit?: string;
  threshold?: number;
}

export interface AggregatedMetrics {
  avg: number;
  min: number;
  max: number;
  p95: number;
}

export interface MetricDefinition {
  name: string;
  description: string;
  unit: string;
  calculate: (data: any) => number;  // We can make this more specific if needed
}

export interface ReportConfig {
  schedule: 'hourly' | 'daily' | 'weekly';
  metrics: string[];
  format: 'json' | 'csv';
  destination: 'storage' | 'email' | 'api';
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  latency: {
    avg: number;
    p95: number;
    p99: number;
  };
  errors: number;
}

export interface RedisInfo {
  used_memory: number;
  connected_clients: number;
  uptime_in_seconds: number;
}

export interface RouteProgress {
  routeId: string;
  currentSegmentIndex: number;
  distanceCovered: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  completionPercentage: number;
  conditions?: {
    weather?: WeatherConditions;
    trail?: TrailConditions;
    traffic?: {
      congestion: number;
      incidents: string[];
    };
  };
} 