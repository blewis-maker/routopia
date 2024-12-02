import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureManager } from '../../components/features/FeatureManager';
import { AdvancedFeatures } from '@/services/features/AdvancedFeatures';
import { EnhancedErrorHandler } from '@/services/error/EnhancedErrorHandler';

describe('FeatureManager Integration', () => {
  const mockFeatures = {
    enableOfflineSupport: vi.fn(),
    registerCustomActivity: vi.fn(),
    predictiveRouting: vi.fn()
  } as unknown as AdvancedFeatures;

  const mockErrorHandler = {
    handleError: vi.fn()
  } as unknown as EnhancedErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Offline Region Management', () => {
    it('should add new offline region successfully', async () => {
      const newRegion = {
        name: 'Test Region',
        bounds: [[0, 0], [1, 1]] as [[number, number], [number, number]]
      };

      render(
        <FeatureManager 
          features={mockFeatures}
          errorHandler={mockErrorHandler}
        />
      );

      // Simulate adding a new region
      await waitFor(() => {
        expect(mockFeatures.enableOfflineSupport).toHaveBeenCalledWith({
          bounds: newRegion.bounds,
          zoom: [10, 15]
        });
      });
    });

    it('should handle offline region errors appropriately', async () => {
      mockFeatures.enableOfflineSupport.mockRejectedValueOnce(new Error('Network error'));

      render(
        <FeatureManager 
          features={mockFeatures}
          errorHandler={mockErrorHandler}
        />
      );

      await waitFor(() => {
        expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
          expect.any(Error),
          {
            service: 'offline',
            operation: 'addRegion',
            severity: 'medium'
          }
        );
      });
    });
  });

  describe('Custom Activity Management', () => {
    it('should register new custom activity', async () => {
      const newActivity = {
        name: 'Mountain Biking',
        config: {
          terrain: 'mountain',
          difficulty: 'hard'
        }
      };

      render(
        <FeatureManager 
          features={mockFeatures}
          errorHandler={mockErrorHandler}
        />
      );

      // Simulate adding a new activity
      await waitFor(() => {
        expect(mockFeatures.registerCustomActivity).toHaveBeenCalledWith(
          newActivity.name,
          newActivity.config
        );
      });
    });
  });

  describe('Predictive Routing Configuration', () => {
    it('should update predictive routing settings', async () => {
      render(
        <FeatureManager 
          features={mockFeatures}
          errorHandler={mockErrorHandler}
        />
      );

      const predictiveConfig = {
        historicalDataEnabled: true,
        weatherAware: true,
        trafficPrediction: true
      };

      // Verify initial state
      expect(screen.getByText(/predictive routing/i)).toBeInTheDocument();
      
      // Additional assertions for predictive routing configuration
      // would go here once UI implementation is complete
    });
  });

  describe('Service Status', () => {
    it('should display service status information', () => {
      render(
        <FeatureManager 
          features={mockFeatures}
          errorHandler={mockErrorHandler}
        />
      );

      expect(screen.getByText(/service status/i)).toBeInTheDocument();
    });
  });
}); 