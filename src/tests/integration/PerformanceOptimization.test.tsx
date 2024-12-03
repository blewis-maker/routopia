import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

describe('Performance Optimization', () => {
  let performanceMetrics: PerformanceMetrics;
  let performanceMonitor: PerformanceMonitor;
  let apiClient: MockAPIClient;

  beforeEach(() => {
    performanceMetrics = new PerformanceMetrics();
    performanceMonitor = new PerformanceMonitor(performanceMetrics);
    apiClient = new MockAPIClient();
    vi.clearAllMocks();
  });

  describe('Initial Load Performance', () => {
    test('should meet core web vital thresholds', async () => {
      await performanceMonitor.measureCoreWebVitals(() => {
        render(
          <TestContextProvider>
            <MainApplicationView />
          </TestContextProvider>
        );
      });

      const metrics = performanceMetrics.getAggregatedMetrics({
        metrics: ['core.fcp', 'core.lcp', 'core.fid', 'core.cls'],
        aggregation: 'avg'
      });

      expect(metrics['core.fcp'].value).toBeLessThan(2000);
      expect(metrics['core.lcp'].value).toBeLessThan(2500);
      expect(metrics['core.fid'].value).toBeLessThan(100);
      expect(metrics['core.cls'].value).toBeLessThan(0.1);
    });

    // ... other tests updated similarly ...
  });

  describe('Runtime Performance', () => {
    test('should maintain frame rate during map interactions', async () => {
      await performanceMonitor.measureFrameRate(() => {
        render(
          <TestContextProvider>
            <MainApplicationView />
          </TestContextProvider>
        );
      });

      const metrics = performanceMetrics.getAggregatedMetrics({
        metrics: ['runtime.fps', 'runtime.drops', 'runtime.jank'],
        aggregation: 'avg'
      });

      expect(metrics['runtime.fps'].value).toBeGreaterThan(30);
      expect(metrics['runtime.drops'].value).toBeLessThan(5);
      expect(metrics['runtime.jank'].value).toBeLessThan(0.1);
    });

    // ... other tests updated similarly ...
  });
}); 