import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';
import { MetricDataManager } from '@/services/monitoring/MetricDataManager';
import { CustomMetricDefinitions } from '@/services/monitoring/CustomMetricDefinitions';
import { AutomatedReporting } from '@/services/monitoring/AutomatedReporting';
import { TestEnvironment } from '../setup/TestEnvironment';
import type { 
  MetricDefinition,
  ReportConfig,
  ExportedMetrics,
  MetricPoint,
  UserPreferences,
  ActivityHistory
} from '@/types/monitoring';

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

  // Phase 1: Data Integrity - User Preferences
  describe('User Preferences Management', () => {
    test('should persist user preferences correctly', async () => {
      const mockPreferences: UserPreferences = {
        theme: 'dark',
        units: 'metric',
        notifications: ['weather', 'route-updates'],
        defaultActivity: 'hiking'
      };

      await dataManager.saveUserPreferences('user-1', mockPreferences);
      const savedPreferences = await dataManager.getUserPreferences('user-1');
      
      expect(savedPreferences).toEqual(mockPreferences);
    });

    test('should handle preference updates', async () => {
      const initialPrefs: UserPreferences = {
        theme: 'light',
        units: 'imperial',
        notifications: ['weather'],
        defaultActivity: 'cycling'
      };

      await dataManager.saveUserPreferences('user-1', initialPrefs);
      
      // Update single preference
      await dataManager.updateUserPreference('user-1', 'theme', 'dark');
      const updatedPrefs = await dataManager.getUserPreferences('user-1');
      
      expect(updatedPrefs.theme).toBe('dark');
      expect(updatedPrefs.units).toBe('imperial'); // Other prefs unchanged
    });
  });

  // Phase 1: Data Integrity - Activity History
  describe('Activity History Tracking', () => {
    test('should record new activity entries', async () => {
      const mockActivity: ActivityHistory = {
        timestamp: new Date().toISOString(),
        type: 'hiking',
        duration: 3600,
        distance: 5000,
        route: 'route-1'
      };

      await dataManager.recordActivity('user-1', mockActivity);
      const history = await dataManager.getActivityHistory('user-1');
      
      expect(history).toContainEqual(mockActivity);
    });

    test('should maintain activity history integrity', async () => {
      const activities = [
        { timestamp: '2024-03-19T10:00:00Z', type: 'hiking', duration: 3600 },
        { timestamp: '2024-03-19T15:00:00Z', type: 'cycling', duration: 1800 }
      ];

      // Record multiple activities
      for (const activity of activities) {
        await dataManager.recordActivity('user-1', activity);
      }

      const history = await dataManager.getActivityHistory('user-1');
      
      expect(history).toHaveLength(2);
      expect(history).toBeSortedBy('timestamp', { descending: true });
    });
  });

  // Keep existing metrics tests
  test('should record and export metrics', async () => {
    // Record some test metrics
    metrics.record('test.metric', 100);
    metrics.record('test.metric', 200);
    
    // Export metrics with proper typing
    const exported = await dataManager.exportMetrics();
    const parsed: ExportedMetrics = JSON.parse(exported);
    
    expect(parsed.metrics['test.metric']).toBeDefined();
    expect(parsed.metrics['test.metric'].points).toHaveLength(2);
  });

  test('should handle custom metric definitions', async () => {
    // Define custom metric with proper typing
    const metricDefinition: MetricDefinition = {
      name: 'test.custom',
      description: 'Test custom metric',
      unit: 'ms',
      calculate: (data: number[]): number => Math.max(...data)
    };
    
    customMetrics.addDefinition(metricDefinition);

    // Calculate custom metric
    const result = customMetrics.calculateMetric('test.custom', [100, 200, 300]);
    expect(result).toBe(300);
  });

  test('should generate and send reports', async () => {
    // Configure test report with proper typing
    const reportConfig: ReportConfig = {
      schedule: 'hourly',
      metrics: ['test.metric'],
      format: 'json',
      destination: 'storage'
    };

    reporting.scheduleReport('test-report', reportConfig);

    // Trigger report generation
    await reporting.generateAndSendReport('test-report');
    
    // Verify report was generated and stored
    const reportData = await testEnv.getStoredReport('test-report');
    expect(reportData).toBeDefined();
  });
}); 