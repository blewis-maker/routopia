import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AppRouter } from '@/components/routing/AppRouter';
import { MockAPIClient } from '../services/connectivity/apiEndpoints.test';
import { MockAuthService } from '../services/connectivity/authFlow.test';
import { IntegrationMonitor } from '@/services/monitoring/IntegrationMonitor';
import { DataSyncManager } from '@/services/data/DataSyncManager';
import { SystemHealthCheck } from '@/services/monitoring/SystemHealthCheck';

describe('System Integration', () => {
  let apiClient: MockAPIClient;
  let authService: MockAuthService;
  let integrationMonitor: IntegrationMonitor;
  let dataSyncManager: DataSyncManager;
  let systemHealth: SystemHealthCheck;

  beforeEach(() => {
    apiClient = new MockAPIClient();
    authService = new MockAuthService();
    integrationMonitor = new IntegrationMonitor();
    dataSyncManager = new DataSyncManager();
    systemHealth = new SystemHealthCheck();
    vi.clearAllMocks();
  });

  describe('User Flow Integration', () => {
    test('should complete full user journey', async () => {
      const user = userEvent.setup();
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Login
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      // Create new route
      await user.click(screen.getByRole('button', { name: 'Create Route' }));
      await user.type(screen.getByLabelText('Route Name'), 'Mountain Trail');
      await user.selectOptions(screen.getByLabelText('Difficulty'), 'moderate');
      await user.click(screen.getByRole('button', { name: 'Generate' }));

      // Verify route creation
      await waitFor(() => {
        expect(screen.getByText('Route created successfully')).toBeInTheDocument();
        expect(screen.getByTestId('route-map')).toBeInTheDocument();
        expect(screen.getByTestId('elevation-profile')).toBeInTheDocument();
      });

      // Save and share
      await user.click(screen.getByRole('button', { name: 'Save Route' }));
      await user.click(screen.getByRole('button', { name: 'Share' }));

      // Verify integration points
      expect(apiClient.post).toHaveBeenCalledWith('/api/routes', expect.any(Object));
      expect(dataSyncManager.getLastSync()).toBeDefined();
    });
  });

  describe('Data Integration', () => {
    test('should maintain data consistency across services', async () => {
      const testRoute = {
        id: 'route-123',
        name: 'Test Route',
        points: [[0, 0], [1, 1]]
      };

      // Simulate multi-service updates
      await dataSyncManager.syncRoute(testRoute);

      const databaseRoute = await apiClient.get(`/api/routes/${testRoute.id}`);
      const cachedRoute = await dataSyncManager.getCachedRoute(testRoute.id);
      const analyticsData = await apiClient.get(`/api/analytics/routes/${testRoute.id}`);

      // Verify data consistency
      expect(databaseRoute.data).toMatchObject(testRoute);
      expect(cachedRoute).toMatchObject(testRoute);
      expect(analyticsData.data.routeId).toBe(testRoute.id);
    });

    test('should handle concurrent operations', async () => {
      const operations = Array(5).fill(null).map((_, i) => ({
        type: 'update',
        data: { id: `route-${i}`, name: `Route ${i}` }
      }));

      // Execute concurrent operations
      const results = await Promise.all(
        operations.map(op => dataSyncManager.processOperation(op))
      );

      // Verify consistency
      expect(results.every(r => r.success)).toBe(true);
      expect(await dataSyncManager.verifyConsistency()).toBe(true);
    });
  });

  describe('Service Integration', () => {
    test('should coordinate between multiple services', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Trigger multi-service operation
      fireEvent.click(screen.getByTestId('generate-route'));

      await waitFor(() => {
        // Verify service coordination
        expect(apiClient.get).toHaveBeenCalledWith('/api/elevation');
        expect(apiClient.get).toHaveBeenCalledWith('/api/weather');
        expect(apiClient.get).toHaveBeenCalledWith('/api/points-of-interest');
      });

      // Verify data integration
      expect(screen.getByTestId('elevation-profile')).toBeInTheDocument();
      expect(screen.getByTestId('weather-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('poi-markers')).toBeInTheDocument();
    });

    test('should maintain service health', async () => {
      const healthReport = await systemHealth.checkAllServices();

      expect(healthReport.api).toBe('healthy');
      expect(healthReport.database).toBe('healthy');
      expect(healthReport.cache).toBe('healthy');
      expect(healthReport.analytics).toBe('healthy');
    });
  });

  describe('Performance Integration', () => {
    test('should maintain performance under load', async () => {
      const metrics = await integrationMonitor.measureIntegrationPerformance(async () => {
        // Simulate heavy load
        const requests = Array(20).fill(null).map(() =>
          apiClient.get('/api/routes')
        );
        await Promise.all(requests);
      });

      expect(metrics.averageResponseTime).toBeLessThan(200);
      expect(metrics.errorRate).toBeLessThan(0.01);
      expect(metrics.successfulRequests).toBe(20);
    });

    test('should optimize resource usage', async () => {
      const resourceMetrics = await integrationMonitor.measureResourceUsage(() => {
        render(
          <TestContextProvider>
            <AppRouter />
          </TestContextProvider>
        );
      });

      expect(resourceMetrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB
      expect(resourceMetrics.cpuUsage).toBeLessThan(80); // 80%
      expect(resourceMetrics.networkRequests).toBeLessThan(50);
    });
  });

  describe('Error Integration', () => {
    test('should handle cascading failures', async () => {
      // Simulate primary service failure
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Primary failed'));

      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Verify fallback to secondary
      await waitFor(() => {
        expect(screen.getByText('Using backup service')).toBeInTheDocument();
      });

      // Verify system stability
      expect(systemHealth.getSystemStatus()).toBe('degraded');
      expect(integrationMonitor.getErrorRate()).toBeLessThan(0.1);
    });
  });
}); 