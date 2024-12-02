import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

describe('PerformanceMetrics', () => {
  let performanceMetrics: PerformanceMetrics;

  beforeEach(() => {
    performanceMetrics = new PerformanceMetrics();
    performanceMetrics.record('api.responseTime', 200);
    performanceMetrics.record('api.responseTime', 300);
    performanceMetrics.record('api.responseTime', 400);
    performanceMetrics.record('api.errorRate', 0.5);
    performanceMetrics.record('api.errorRate', 0.7);
  });

  it('should aggregate metrics with avg', () => {
    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['api.responseTime'],
      aggregation: 'avg'
    });

    expect(result['api.responseTime'].value).toBe(300);
  });

  it('should aggregate metrics with min', () => {
    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['api.responseTime'],
      aggregation: 'min'
    });

    expect(result['api.responseTime'].value).toBe(200);
  });

  it('should aggregate metrics with max', () => {
    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['api.responseTime'],
      aggregation: 'max'
    });

    expect(result['api.responseTime'].value).toBe(400);
  });

  it('should aggregate metrics with sum', () => {
    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['api.responseTime'],
      aggregation: 'sum'
    });

    expect(result['api.responseTime'].value).toBe(900);
  });

  it('should handle empty metrics gracefully', () => {
    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['non.existent.metric'],
      aggregation: 'avg'
    });

    expect(result).toEqual({});
  });

  it('should filter metrics by time range', () => {
    const now = Date.now();
    performanceMetrics.record('api.responseTime', 500, { timestamp: now - 10000 });
    performanceMetrics.record('api.responseTime', 600, { timestamp: now - 5000 });

    const result = performanceMetrics.getAggregatedMetrics({
      metrics: ['api.responseTime'],
      aggregation: 'avg',
      timeRange: {
        start: now - 8000,
        end: now
      }
    });

    expect(result['api.responseTime'].value).toBe(550);
  });
}); 