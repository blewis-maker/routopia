import { describe, test, expect, beforeEach, vi } from 'vitest';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { MetricDataManager } from '@/services/monitoring/MetricDataManager';
import { CustomMetricDefinitions } from '@/services/monitoring/CustomMetricDefinitions';
import { AutomatedReporting } from '@/services/monitoring/AutomatedReporting';
import type { 
  MetricDefinition,
  ReportConfig,
  AggregatedMetrics,
  MetricPoint
} from '@/types/monitoring';

describe('Extended Metrics System Tests', () => {
  let metrics: PerformanceMetrics;
  let dataManager: MetricDataManager;
  let customMetrics: CustomMetricDefinitions;
  let reporting: AutomatedReporting;

  beforeEach(() => {
    metrics = new PerformanceMetrics();
    dataManager = new MetricDataManager(metrics);
    customMetrics = new CustomMetricDefinitions(metrics);
    reporting = new AutomatedReporting(metrics);
  });

  describe('Performance Metrics', () => {
    test('should calculate accurate aggregations', () => {
      // Initialize with proper metric
      metrics.addMetric('test.metric', 'count');
      
      const values: number[] = [10, 20, 30, 40, 50];
      values.forEach(v => metrics.record('test.metric', v));

      const stats = metrics.getAggregatedMetrics({
        metrics: ['test.metric'],
        aggregation: 'avg'
      });

      expect(stats['test.metric']?.value).toBe(30);
      expect(stats['test.metric']?.unit).toBe('count');
    });

    test('should handle complex metric calculations', () => {
      type ComplexMetricData = {
        a: number;
        b: number[];
      };

      customMetrics.addDefinition({
        name: 'test.complex',
        description: 'Complex metric',
        unit: 'score',
        calculate: (data: ComplexMetricData) => {
          const bAvg = data.b.reduce((sum, n) => sum + n, 0) / data.b.length;
          return data.a * bAvg;
        }
      });

      const result = customMetrics.calculateMetric('test.complex', {
        a: 2,
        b: [1, 2, 3]
      });

      expect(result).toBe(4);
    });
  });
}); 