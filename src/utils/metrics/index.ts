import { Counter, Gauge, Histogram } from 'prom-client';
import logger from '@/utils/logger';

export class MetricsCollector {
  private namespace: string;
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public increment(metric: string, value: number = 1): void {
    try {
      let counter = this.counters.get(metric);
      if (!counter) {
        counter = new Counter({
          name: `${this.namespace}_${metric}_total`,
          help: `Counter for ${metric} in ${this.namespace}`
        });
        this.counters.set(metric, counter);
      }
      counter.inc(value);
    } catch (error) {
      logger.error(`Failed to increment metric ${metric}:`, error);
    }
  }

  public gauge(metric: string, value: number): void {
    try {
      let gauge = this.gauges.get(metric);
      if (!gauge) {
        gauge = new Gauge({
          name: `${this.namespace}_${metric}`,
          help: `Gauge for ${metric} in ${this.namespace}`
        });
        this.gauges.set(metric, gauge);
      }
      gauge.set(value);
    } catch (error) {
      logger.error(`Failed to set gauge ${metric}:`, error);
    }
  }

  public timing(metric: string, value: number): void {
    try {
      let histogram = this.histograms.get(metric);
      if (!histogram) {
        histogram = new Histogram({
          name: `${this.namespace}_${metric}_seconds`,
          help: `Timing histogram for ${metric} in ${this.namespace}`,
          buckets: [0.1, 0.5, 1, 2, 5]
        });
        this.histograms.set(metric, histogram);
      }
      histogram.observe(value / 1000); // Convert ms to seconds
    } catch (error) {
      logger.error(`Failed to record timing ${metric}:`, error);
    }
  }

  public reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
} 