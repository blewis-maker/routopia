import type { MetricPoint, PerformanceMetric } from '@/types/monitoring';

interface MetricEntry {
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMetrics {
  private metrics: Map<string, MetricEntry[]>;
  private readonly maxEntries: number = 1000;

  constructor() {
    this.metrics = new Map();
  }

  record(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const entries = this.metrics.get(name)!;
    entries.push({
      value,
      timestamp: Date.now(),
      metadata
    });

    // Keep only the last maxEntries
    if (entries.length > this.maxEntries) {
      entries.splice(0, entries.length - this.maxEntries);
    }
  }

  getMetric(name: string): MetricEntry[] {
    return this.metrics.get(name) || [];
  }

  getAverage(name: string, timeWindow?: number): number | null {
    const entries = this.getMetric(name);
    if (entries.length === 0) return null;

    let filteredEntries = entries;
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      filteredEntries = entries.filter(entry => entry.timestamp >= cutoff);
    }

    if (filteredEntries.length === 0) return null;

    const sum = filteredEntries.reduce((acc, entry) => acc + entry.value, 0);
    return sum / filteredEntries.length;
  }

  getPercentile(name: string, percentile: number, timeWindow?: number): number | null {
    const entries = this.getMetric(name);
    if (entries.length === 0) return null;

    let filteredEntries = entries;
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      filteredEntries = entries.filter(entry => entry.timestamp >= cutoff);
    }

    if (filteredEntries.length === 0) return null;

    const sortedValues = filteredEntries
      .map(entry => entry.value)
      .sort((a, b) => a - b);

    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[index];
  }

  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  getSummary(timeWindow?: number): Record<string, {
    count: number;
    average: number | null;
    p95: number | null;
    p99: number | null;
  }> {
    const summary: Record<string, any> = {};

    for (const name of this.getMetricNames()) {
      const entries = this.getMetric(name);
      let filteredEntries = entries;

      if (timeWindow) {
        const cutoff = Date.now() - timeWindow;
        filteredEntries = entries.filter(entry => entry.timestamp >= cutoff);
      }

      summary[name] = {
        count: filteredEntries.length,
        average: this.getAverage(name, timeWindow),
        p95: this.getPercentile(name, 95, timeWindow),
        p99: this.getPercentile(name, 99, timeWindow)
      };
    }

    return summary;
  }
} 