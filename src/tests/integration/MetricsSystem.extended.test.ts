import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { MetricDataManager } from '@/services/monitoring/MetricDataManager';
import { CustomMetricDefinitions } from '@/services/monitoring/CustomMetricDefinitions';
import { AutomatedReporting } from '@/services/monitoring/AutomatedReporting';
import { ReportingHelpers } from '@/services/monitoring/ReportingHelpers';

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
    test('should handle threshold alerts', () => {
      const alertMock = vi.fn();
      metrics.onThresholdExceeded(alertMock);

      metrics.record('test.metric', 150, { threshold: 100 });
      expect(alertMock).toHaveBeenCalled();
    });

    test('should calculate accurate aggregations', () => {
      const values = [10, 20, 30, 40, 50];
      values.forEach(v => metrics.record('test.metric', v));

      const stats = metrics.getAggregatedMetrics('test.metric');
      expect(stats.avg).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.p95).toBe(48.5);
    });
  });

  describe('Custom Metrics', () => {
    test('should handle complex calculations', () => {
      customMetrics.addDefinition({
        name: 'test.complex',
        description: 'Complex metric',
        unit: 'score',
        calculate: (data: { a: number; b: number[] }) => {
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

  describe('Reporting System', () => {
    test('should generate correct CSV format', () => {
      const data = [
        { name: 'metric1', avg: 100, min: 50, max: 150, p95: 140, unit: 'ms' }
      ];
      const csv = ReportingHelpers.convertToCSV(data);
      expect(csv).toContain('metric1,100.00,50.00,150.00,140.00,ms');
    });

    test('should handle report scheduling', async () => {
      vi.useFakeTimers();
      const generateMock = vi.spyOn(reporting, 'generateAndSendReport');

      reporting.scheduleReport('test', {
        schedule: 'hourly',
        metrics: ['test.metric'],
        format: 'json',
        destination: 'storage'
      });

      vi.advanceTimersByTime(3600000); // 1 hour
      expect(generateMock).toHaveBeenCalledWith('test');
      vi.useRealTimers();
    });
  });

  describe('Data Export/Import', () => {
    test('should maintain data integrity through export/import cycle', async () => {
      // Record original data
      metrics.record('test.metric', 100);
      metrics.record('test.metric', 200);

      // Export
      const exported = await dataManager.exportMetrics();

      // Clear and import
      metrics = new PerformanceMetrics();
      await dataManager.importMetrics(exported);

      // Verify
      const importedMetric = metrics.getMetric('test.metric');
      expect(importedMetric?.points).toHaveLength(2);
      expect(importedMetric?.points[0].value).toBe(100);
      expect(importedMetric?.points[1].value).toBe(200);
    });
  });
}); 