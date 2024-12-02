import type { MetricPoint, PerformanceMetric } from '@/types/monitoring';

export class PerformanceMetrics {
  private metrics: Map<string, PerformanceMetric>;
  private readonly MAX_HISTORY = 1000;
  private observers: Set<(metric: PerformanceMetric) => void>;

  constructor() {
    this.metrics = new Map();
    this.observers = new Set();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Route metrics
    this.addMetric('route.loadTime', 'ms', 1000);
    this.addMetric('route.renderTime', 'ms', 500);
    this.addMetric('route.cacheHitRate', '%', 80);

    // Map metrics
    this.addMetric('map.fps', 'fps', 30);
    this.addMetric('map.tileLoadTime', 'ms', 200);
    this.addMetric('map.memoryUsage', 'MB', 100);

    // API metrics
    this.addMetric('api.responseTime', 'ms', 300);
    this.addMetric('api.errorRate', '%', 1);
    this.addMetric('api.requestCount', 'count');
  }

  private addMetric(name: string, unit: string, threshold?: number): void {
    this.metrics.set(name, {
      name,
      points: [],
      threshold,
      unit
    });
  }

  record(name: string, value: number, metadata?: Record<string, any>): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    const point: MetricPoint = {
      value,
      timestamp: Date.now(),
      metadata
    };

    metric.points.push(point);
    if (metric.points.length > this.MAX_HISTORY) {
      metric.points.shift();
    }

    this.checkThreshold(metric, point);
    this.notifyObservers(metric);
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  subscribe(callback: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private checkThreshold(metric: PerformanceMetric, point: MetricPoint): void {
    if (metric.threshold && point.value > metric.threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}:`, {
        value: point.value,
        threshold: metric.threshold,
        unit: metric.unit,
        metadata: point.metadata
      });
    }
  }

  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach(observer => observer(metric));
  }

  getAggregatedMetrics(options: {
    timeRange?: {
      start: number;
      end: number;
    };
    metrics?: string[];
    aggregation: 'avg' | 'min' | 'max' | 'sum';
  }): Record<string, {
    value: number;
    unit: string;
  }> {
    const result: Record<string, { value: number; unit: string }> = {};
    const metricsToAggregate = options.metrics || Array.from(this.metrics.keys());

    metricsToAggregate.forEach(metricName => {
      const metric = this.metrics.get(metricName);
      if (!metric) return;

      let points = metric.points;
      if (options.timeRange) {
        points = points.filter(point => 
          point.timestamp >= options.timeRange!.start && 
          point.timestamp <= options.timeRange!.end
        );
      }

      if (points.length === 0) return;

      let value: number;
      switch (options.aggregation) {
        case 'min':
          value = Math.min(...points.map(p => p.value));
          break;
        case 'max':
          value = Math.max(...points.map(p => p.value));
          break;
        case 'sum':
          value = points.reduce((sum, p) => sum + p.value, 0);
          break;
        case 'avg':
        default:
          value = points.reduce((sum, p) => sum + p.value, 0) / points.length;
      }

      result[metricName] = {
        value,
        unit: metric.unit
      };
    });

    return result;
  }
} 