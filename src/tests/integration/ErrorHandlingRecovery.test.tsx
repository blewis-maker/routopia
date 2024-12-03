import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AppRouter } from '@/components/routing/AppRouter';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { MockAPIClient } from '../services/connectivity/apiEndpoints.test';
import { ErrorMonitor } from '@/services/monitoring/ErrorMonitor';
import { RetryManager } from '@/services/error/RetryManager';
import { FallbackStrategy } from '@/services/error/FallbackStrategy';

describe('Error Handling and Recovery', () => {
  let apiClient: MockAPIClient;
  let errorMonitor: ErrorMonitor;
  let retryManager: RetryManager;
  let fallbackStrategy: FallbackStrategy;

  beforeEach(() => {
    apiClient = new MockAPIClient();
    errorMonitor = new ErrorMonitor();
    retryManager = new RetryManager();
    fallbackStrategy = new FallbackStrategy();
    vi.clearAllMocks();
  });

  describe('Network Error Recovery', () => {
    test('should handle offline state gracefully', async () => {
      // Simulate offline state
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      
      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Verify offline message
      expect(screen.getByText('You are currently offline')).toBeInTheDocument();
      
      // Verify cached data is available
      expect(screen.getByTestId('cached-routes')).toBeInTheDocument();
      
      // Test reconnection
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
      window.dispatchEvent(new Event('online'));
      
      await waitFor(() => {
        expect(screen.queryByText('You are currently offline')).not.toBeInTheDocument();
        expect(screen.getByText('Connection restored')).toBeInTheDocument();
      });
    });

    test('should implement retry mechanism for failed requests', async () => {
      const retryableError = new Error('Network timeout');
      vi.spyOn(apiClient, 'get')
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({ status: 200, data: [] });

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(3);
        expect(screen.getByText('Data loaded successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Data Recovery', () => {
    test('should recover from corrupted state', async () => {
      // Simulate corrupted state
      localStorage.setItem('app_state', 'corrupted_json{');
      
      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Verify state recovery
      expect(errorMonitor.getStateRecoveryLog()).toContain('State recovered from backup');
      expect(screen.getByTestId('app-container')).toBeInTheDocument();
    });

    test('should handle partial data loading', async () => {
      const partialData = { routes: [], user: null };
      vi.spyOn(apiClient, 'get').mockResolvedValue({ 
        status: 206,
        data: partialData 
      });

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Verify partial data handling
      expect(screen.getByText('Some data is still loading')).toBeInTheDocument();
      expect(screen.getByTestId('partial-content')).toBeInTheDocument();
    });
  });

  describe('UI Error Boundaries', () => {
    test('should isolate component failures', async () => {
      const BrokenComponent = () => {
        throw new Error('Component failure');
      };

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <div>
              <h1>Working Part</h1>
              <ErrorBoundary>
                <BrokenComponent />
              </ErrorBoundary>
              <footer>Still Working</footer>
            </div>
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Verify error containment
      expect(screen.getByText('Working Part')).toBeInTheDocument();
      expect(screen.getByText('Still Working')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('should provide recovery options', async () => {
      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Trigger error
      fireEvent.click(screen.getByTestId('trigger-error'));

      // Verify recovery UI
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      
      // Test recovery action
      fireEvent.click(screen.getByText('Retry'));
      
      await waitFor(() => {
        expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Reporting', () => {
    test('should log errors appropriately', async () => {
      const error = new Error('Test error');
      vi.spyOn(errorMonitor, 'logError');

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Trigger error
      fireEvent.click(screen.getByTestId('trigger-error'));

      expect(errorMonitor.logError).toHaveBeenCalledWith(
        expect.objectContaining({
          error,
          context: expect.any(Object),
          timestamp: expect.any(Number)
        })
      );
    });

    test('should handle error recovery analytics', async () => {
      vi.spyOn(errorMonitor, 'trackRecovery');

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      // Trigger and recover from error
      fireEvent.click(screen.getByTestId('trigger-error'));
      fireEvent.click(screen.getByText('Retry'));

      expect(errorMonitor.trackRecovery).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          context: expect.any(Object),
          timestamp: expect.any(Number)
        })
      );
    });
  });
}); 