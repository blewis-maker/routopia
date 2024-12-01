import { analytics } from '../analytics/analyticsService';

export class PerformanceMonitoringService {
  private metrics: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map([
    ['pageLoad', 3000],      // 3 seconds
    ['apiLatency', 500],     // 500ms
    ['renderTime', 100],     // 100ms
    ['memoryUsage', 50],     // 50MB
    ['cacheHitRate', 0.8]    // 80%
  ]);

  initialize() {
    // Setup performance observers
    this.setupPerformanceObservers();
    
    // Initialize metric collection
    this.initializeMetrics();
    
    // Start monitoring
    this.startMonitoring();
  }

  private setupPerformanceObservers() {
    // Monitor page load metrics
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('pageLoad', entry.duration);
      }
    }).observe({ entryTypes: ['navigation'] });

    // Monitor long tasks
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('longTask', entry.duration);
      }
    }).observe({ entryTypes: ['longtask'] });

    // Monitor layout shifts
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('layoutShift', entry.value);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private initializeMetrics() {
    // Initialize core metrics
    this.metrics.set('pageLoad', []);
    this.metrics.set('apiLatency', []);
    this.metrics.set('renderTime', []);
    this.metrics.set('memoryUsage', []);
    this.metrics.set('cacheHitRate', []);
  }

  recordMetric(name: string, value: number) {
    const metrics = this.metrics.get(name) || [];
    metrics.push(value);
    this.metrics.set(name, metrics);

    // Check threshold
    const threshold = this.thresholds.get(name);
    if (threshold && value > threshold) {
      this.handleThresholdExceeded(name, value, threshold);
    }

    // Report to analytics
    analytics.trackPerformanceMetric(name, value);
  }

  private handleThresholdExceeded(metric: string, value: number, threshold: number) {
    console.warn(`Performance threshold exceeded: ${metric} = ${value} (threshold: ${threshold})`);
    // Implement additional handling (alerts, logging, etc.)
  }

  getMetricsSummary(): PerformanceMetricsSummary {
    const summary: PerformanceMetricsSummary = {};
    
    for (const [metric, values] of this.metrics.entries()) {
      if (values.length === 0) continue;
      
      summary[metric] = {
        average: values.reduce((a, b) => a + b) / values.length,
        max: Math.max(...values),
        min: Math.min(...values),
        latest: values[values.length - 1],
        threshold: this.thresholds.get(metric)
      };
    }
    
    return summary;
  }

  startMonitoring() {
    // Monitor at regular intervals
    setInterval(() => {
      // Memory usage
      if (performance.memory) {
        this.recordMetric('memoryUsage', performance.memory.usedJSHeapSize / (1024 * 1024));
      }

      // Cache hit rate
      const hitRate = this.calculateCacheHitRate();
      this.recordMetric('cacheHitRate', hitRate);

    }, 60000); // Every minute
  }
} 