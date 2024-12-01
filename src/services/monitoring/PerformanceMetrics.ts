interface MetricPoint {
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  points: MetricPoint[];
  threshold?: number;
  unit: string;
}

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

  getAggregatedMetrics(
} 