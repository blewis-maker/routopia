import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AppRouter } from '@/components/routing/AppRouter';
import { LoadingProvider } from '@/components/feedback/LoadingProvider';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { MockAPIClient } from '../services/connectivity/apiEndpoints.test';
import { PerformanceMonitor } from '@/services/monitoring/PerformanceMonitor';

describe('User Experience Integration', () => {
  let apiClient: MockAPIClient;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    apiClient = new MockAPIClient();
    performanceMonitor = new PerformanceMonitor();
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    test('should show appropriate loading states during navigation', async () => {
      render(
        <TestContextProvider>
          <LoadingProvider>
            <AppRouter />
          </LoadingProvider>
        </TestContextProvider>
      );

      // Click route that triggers loading
      fireEvent.click(screen.getByText('View Routes'));

      // Verify loading indicator appears
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for content
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getByText('My Routes')).toBeInTheDocument();
      });

      // Verify loading time was acceptable
      const metrics = performanceMonitor.getNavigationMetrics();
      expect(metrics.loadTime).toBeLessThan(1000);
    });

    test('should handle slow connections gracefully', async () => {
      vi.spyOn(apiClient, 'get').mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { status: 200, data: [] };
      });

      render(
        <TestContextProvider>
          <LoadingProvider>
            <AppRouter />
          </LoadingProvider>
        </TestContextProvider>
      );

      fireEvent.click(screen.getByText('View Routes'));

      // Verify loading message updates for long waits
      await waitFor(() => {
        expect(screen.getByText('Taking longer than usual...')).toBeInTheDocument();
      }, { timeout: 2500 });
    });
  });

  describe('Error Feedback', () => {
    test('should display user-friendly error messages', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network Error'));

      render(
        <TestContextProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </TestContextProvider>
      );

      fireEvent.click(screen.getByText('View Routes'));

      await waitFor(() => {
        expect(screen.getByText('Unable to load routes')).toBeInTheDocument();
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });

      // Test retry functionality
      fireEvent.click(screen.getByText('Try again'));
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Interactive Elements', () => {
    test('should provide immediate feedback on user actions', async () => {
      const user = userEvent.setup();
      
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test button feedback
      const actionButton = screen.getByText('Save Route');
      await user.click(actionButton);
      expect(actionButton).toHaveClass('active');
      
      await waitFor(() => {
        expect(actionButton).toHaveClass('success');
        expect(screen.getByText('Route Saved!')).toBeInTheDocument();
      });

      // Verify feedback disappears
      await waitFor(() => {
        expect(screen.queryByText('Route Saved!')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should handle form interactions smoothly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test real-time validation
      const nameInput = screen.getByLabelText('Route Name');
      await user.type(nameInput, 'Test');
      expect(nameInput).toHaveClass('valid');

      await user.clear(nameInput);
      expect(nameInput).toHaveClass('invalid');
      expect(screen.getByText('Name is required')).toBeInTheDocument();

      // Test auto-save
      await user.type(nameInput, 'My Route');
      await waitFor(() => {
        expect(screen.getByText('Changes saved')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Accessibility', () => {
    test('should maintain focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Test keyboard navigation
      await user.tab();
      expect(screen.getByText('View Routes')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Create Route')).toHaveFocus();

      // Test modal focus trap
      fireEvent.click(screen.getByText('Create Route'));
      await user.tab();
      expect(screen.getByLabelText('Route Name')).toHaveFocus();
    });

    test('should announce dynamic content changes', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      fireEvent.click(screen.getByText('Save Route'));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Route saved successfully');
      });
    });
  });
}); 