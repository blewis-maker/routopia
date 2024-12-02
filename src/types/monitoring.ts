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