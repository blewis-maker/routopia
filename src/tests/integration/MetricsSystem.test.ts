import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { MetricDataManager } from '@/services/monitoring/MetricDataManager';
import { CustomMetricDefinitions } from '@/services/monitoring/CustomMetricDefinitions';
import { AutomatedReporting } from '@/services/monitoring/AutomatedReporting';
import { TestEnvironment } from '../setup/TestEnvironment';

describe('Metrics System Integration', () => {
  let testEnv: TestEnvironment;
  let metrics: PerformanceMetrics;
  let dataManager: MetricDataManager;
  let customMetrics: CustomMetricDefinitions;
  let reporting: AutomatedReporting;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
    
    metrics = new PerformanceMetrics();
    dataManager = new MetricDataManager(metrics);
    customMetrics = new CustomMetricDefinitions(metrics);
    reporting = new AutomatedReporting(metrics);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  test('should record and export metrics', async () => {
    // Record some test metrics
    metrics.record('test.metric', 100);
    metrics.record('test.metric', 200);
    
    // Export metrics
    const exported = await dataManager.exportMetrics();
    const parsed = JSON.parse(exported);
    
    expect(parsed.metrics['test.metric']).toBeDefined();
    expect(parsed.metrics['test.metric'].points).toHaveLength(2);
  });

  test('should handle custom metric definitions', async () => {
    // Define custom metric
    customMetrics.addDefinition({
      name: 'test.custom',
      description: 'Test custom metric',
      unit: 'ms',
      calculate: (data: number[]) => Math.max(...data)
    });

    // Calculate custom metric
    const result = customMetrics.calculateMetric('test.custom', [100, 200, 300]);
    expect(result).toBe(300);
  });

  test('should generate and send reports', async () => {
    // Configure test report
    reporting.scheduleReport('test-report', {
      schedule: 'hourly',
      metrics: ['test.metric'],
      format: 'json',
      destination: 'storage'
    });

    // Trigger report generation
    await reporting.generateAndSendReport('test-report');
    
    // Verify report was generated and stored
    const reportData = await testEnv.getStoredReport('test-report');
    expect(reportData).toBeDefined();
  });
}); 