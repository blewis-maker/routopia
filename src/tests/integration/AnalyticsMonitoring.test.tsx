import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AppRouter } from '@/components/routing/AppRouter';
import { AnalyticsProvider } from '@/services/analytics/AnalyticsProvider';
import { MetricsCollector } from '@/services/monitoring/MetricsCollector';
import { UserBehaviorTracker } from '@/services/analytics/UserBehaviorTracker';
import { PerformanceAnalyzer } from '@/services/monitoring/PerformanceAnalyzer';
import { ReportGenerator } from '@/services/analytics/ReportGenerator';

describe('Analytics and Monitoring', () => {
  let analyticsProvider: AnalyticsProvider;
  let metricsCollector: MetricsCollector;
  let behaviorTracker: UserBehaviorTracker;
  let performanceAnalyzer: PerformanceAnalyzer;
  let reportGenerator: ReportGenerator;

  beforeEach(() => {
    analyticsProvider = new AnalyticsProvider();
    metricsCollector = new MetricsCollector();
    behaviorTracker = new UserBehaviorTracker();
    performanceAnalyzer = new PerformanceAnalyzer();
    reportGenerator = new ReportGenerator();
    vi.clearAllMocks();
  });

  describe('User Analytics', () => {
    test('should track user interactions accurately', async () => {
      const user = userEvent.setup();
      render(
        <TestContextProvider>
          <AnalyticsProvider>
            <AppRouter />
          </AnalyticsProvider>
        </TestContextProvider>
      );

      // Track navigation
      await user.click(screen.getByText('Create Route'));
      expect(analyticsProvider.getEvent('navigation')).toMatchObject({
        type: 'pageView',
        path: '/create-route'
      });

      // Track feature usage
      await user.click(screen.getByText('Generate'));
      expect(analyticsProvider.getEvent('feature')).toMatchObject({
        type: 'routeGeneration',
        parameters: expect.any(Object)
      });

      // Track user engagement
      const sessionData = behaviorTracker.getSessionData();
      expect(sessionData.duration).toBeGreaterThan(0);
      expect(sessionData.interactions).toBeGreaterThan(0);
    });

    test('should analyze user behavior patterns', async () => {
      // Simulate user sessions
      const sessions = await behaviorTracker.analyzeSessions({
        timeframe: '7d',
        metrics: ['engagement', 'retention', 'conversion']
      });

      expect(sessions.averageEngagement).toBeGreaterThan(0);
      expect(sessions.retentionRate).toBeGreaterThan(0.4); // 40%
      expect(sessions.conversionRate).toBeGreaterThan(0.1); // 10%
    });
  });

  describe('Performance Monitoring', () => {
    test('should collect comprehensive metrics', async () => {
      render(
        <TestContextProvider>
          <AnalyticsProvider>
            <AppRouter />
          </AnalyticsProvider>
        </TestContextProvider>
      );

      const metrics = await metricsCollector.gatherMetrics();

      // Verify core metrics
      expect(metrics.frontend).toMatchObject({
        fcp: expect.any(Number),
        lcp: expect.any(Number),
        fid: expect.any(Number),
        cls: expect.any(Number)
      });

      // Verify custom metrics
      expect(metrics.custom).toMatchObject({
        routeGenerationTime: expect.any(Number),
        mapRenderTime: expect.any(Number),
        dataProcessingTime: expect.any(Number)
      });
    });

    test('should analyze performance trends', async () => {
      const trends = await performanceAnalyzer.analyzeTrends({
        timeframe: '30d',
        metrics: ['response_time', 'error_rate', 'resource_usage']
      });

      expect(trends.performance).toMatchObject({
        improving: expect.any(Boolean),
        degradation: expect.any(Array),
        anomalies: expect.any(Array)
      });
    });
  });

  describe('Error Tracking', () => {
    test('should track and categorize errors', async () => {
      render(
        <TestContextProvider>
          <AnalyticsProvider>
            <AppRouter />
          </AnalyticsProvider>
        </TestContextProvider>
      );

      // Trigger various errors
      fireEvent.click(screen.getByTestId('trigger-error'));
      
      const errorReport = await analyticsProvider.getErrorReport();
      expect(errorReport.categories).toMatchObject({
        network: expect.any(Number),
        validation: expect.any(Number),
        runtime: expect.any(Number)
      });
    });

    test('should analyze error patterns', async () => {
      const patterns = await analyticsProvider.analyzeErrorPatterns({
        timeframe: '7d'
      });

      expect(patterns).toMatchObject({
        mostCommon: expect.any(Array),
        trending: expect.any(Array),
        impactScore: expect.any(Number)
      });
    });
  });

  describe('Reporting', () => {
    test('should generate accurate reports', async () => {
      const report = await reportGenerator.generateReport({
        type: 'system_health',
        timeframe: '24h'
      });

      expect(report).toMatchObject({
        metrics: expect.any(Object),
        insights: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });

    test('should track business metrics', async () => {
      const metrics = await analyticsProvider.getBusinessMetrics({
        timeframe: '30d'
      });

      expect(metrics).toMatchObject({
        activeUsers: expect.any(Number),
        routesGenerated: expect.any(Number),
        userRetention: expect.any(Number),
        systemHealth: expect.any(Number)
      });
    });
  });

  describe('Real-time Monitoring', () => {
    test('should monitor system health in real-time', async () => {
      const monitor = metricsCollector.startRealTimeMonitoring();

      // Simulate load
      for (let i = 0; i < 10; i++) {
        render(
          <TestContextProvider>
            <AnalyticsProvider>
              <AppRouter />
            </AnalyticsProvider>
          </TestContextProvider>
        );
      }

      const healthMetrics = await monitor.getMetrics();
      expect(healthMetrics).toMatchObject({
        cpu: expect.any(Number),
        memory: expect.any(Number),
        responseTime: expect.any(Number),
        errorRate: expect.any(Number)
      });

      monitor.stop();
    });

    test('should detect anomalies in real-time', async () => {
      const anomalyDetector = performanceAnalyzer.startAnomalyDetection();

      // Simulate abnormal behavior
      fireEvent.click(screen.getByTestId('heavy-operation'));

      const alerts = await anomalyDetector.getAlerts();
      expect(alerts).toContainEqual(
        expect.objectContaining({
          type: 'performance_degradation',
          severity: expect.any(String)
        })
      );

      anomalyDetector.stop();
    });
  });
}); 