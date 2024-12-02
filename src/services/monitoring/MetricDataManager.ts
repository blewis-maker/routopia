import type { MetricPoint, PerformanceMetric } from '@/types/monitoring';

interface ExportFormat {
  version: string;
  timestamp: number;
  metrics: Record<string, PerformanceMetric>;
  metadata: {
    environment: string;
    sessionId: string;
    userAgent: string;
  };
}

export class MetricDataManager {
  private readonly VERSION = '1.0.0';

  constructor(private performanceMetrics: PerformanceMetrics) {}

  async exportMetrics(timeRange?: { start: number; end: number }): Promise<string> {
    const metrics = this.performanceMetrics.getAllMetrics();
    const filteredMetrics: Record<string, PerformanceMetric> = {};

    // Filter metrics based on timeRange if provided
    for (const [name, metric] of Object.entries(metrics)) {
      if (timeRange) {
        filteredMetrics[name] = {
          ...metric,
          points: metric.points.filter(
            p => p.timestamp >= timeRange.start && p.timestamp <= timeRange.end
          )
        };
      } else {
        filteredMetrics[name] = metric;
      }
    }

    const exportData: ExportFormat = {
      version: this.VERSION,
      timestamp: Date.now(),
      metrics: filteredMetrics,
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        sessionId: this.generateSessionId(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importMetrics(data: string): Promise<void> {
    try {
      const importData: ExportFormat = JSON.parse(data);
      
      // Version check
      if (importData.version !== this.VERSION) {
        throw new Error(`Version mismatch: expected ${this.VERSION}, got ${importData.version}`);
      }

      // Import metrics
      for (const [name, metric] of Object.entries(importData.metrics)) {
        await this.performanceMetrics.importMetric(name, metric);
      }
    } catch (error) {
      console.error('Failed to import metrics:', error);
      throw error;
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 