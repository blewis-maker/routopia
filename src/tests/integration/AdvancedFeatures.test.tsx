import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { AdvancedFeatures } from '../../components/AdvancedFeatures';
import { mockGenerators } from '../utils/mockGenerators';
import type { UserPreferences, FeatureFlags } from '../../types/advanced';

describe('AdvancedFeatures Integration', () => {
  const mockPreferences: UserPreferences = {
    routeOptimization: 'balanced',
    avoidHighways: true,
    preferScenic: true,
    maxElevationGain: 500,
    restStopFrequency: 'medium',
    notifications: {
      weather: true,
      hazards: true,
      milestones: true
    }
  };

  const mockFeatureFlags: FeatureFlags = {
    experimentalRouting: true,
    weatherAlerts: true,
    trafficPrediction: true,
    socialSharing: true,
    offlineMode: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Optimization', () => {
    it('should apply user preferences to route calculation', async () => {
      const mockRoute = mockGenerators.createMockRoute();
      
      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={mockFeatureFlags}
            initialRoute={mockRoute}
          />
        </TestContextProvider>
      );

      const optimizeButton = screen.getByRole('button', { name: /optimize route/i });
      fireEvent.click(optimizeButton);

      await waitFor(() => {
        expect(screen.getByText(/route optimized/i)).toBeInTheDocument();
        expect(screen.getByText(/avoiding highways/i)).toBeInTheDocument();
        expect(screen.getByText(/scenic preference applied/i)).toBeInTheDocument();
      });
    });

    it('should respect elevation constraints', async () => {
      const highElevationRoute = mockGenerators.createMockRoute({
        elevation: {
          gain: 800, // Exceeds maxElevationGain
          loss: 300,
          points: []
        }
      });

      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={mockFeatureFlags}
            initialRoute={highElevationRoute}
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/elevation exceeds preference/i)).toBeInTheDocument();
        expect(screen.getByText(/alternative routes available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Feature Flag Integration', () => {
    it('should enable experimental routing features when flag is true', async () => {
      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={mockFeatureFlags}
            initialRoute={mockGenerators.createMockRoute()}
          />
        </TestContextProvider>
      );

      expect(screen.getByTestId('experimental-routing')).toBeInTheDocument();
      expect(screen.getByText(/ai-powered optimization/i)).toBeInTheDocument();
    });

    it('should handle offline mode appropriately', async () => {
      const offlineFlags = { ...mockFeatureFlags, offlineMode: true };
      
      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={offlineFlags}
            initialRoute={mockGenerators.createMockRoute()}
          />
        </TestContextProvider>
      );

      expect(screen.getByText(/offline mode active/i)).toBeInTheDocument();
      expect(screen.getByText(/cached route data/i)).toBeInTheDocument();
    });
  });

  describe('Weather Integration', () => {
    it('should show weather alerts when enabled', async () => {
      const mockWeatherAlert = {
        type: 'storm',
        severity: 'moderate',
        affectedSegments: [0, 1, 2]
      };

      vi.mock('../../services/weather', () => ({
        getWeatherAlerts: () => Promise.resolve([mockWeatherAlert])
      }));

      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={mockFeatureFlags}
            initialRoute={mockGenerators.createMockRoute()}
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/storm warning/i)).toBeInTheDocument();
        expect(screen.getByText(/affects 3 segments/i)).toBeInTheDocument();
      });
    });
  });

  describe('Social Features', () => {
    it('should enable route sharing when socialSharing flag is true', async () => {
      render(
        <TestContextProvider>
          <AdvancedFeatures
            preferences={mockPreferences}
            featureFlags={mockFeatureFlags}
            initialRoute={mockGenerators.createMockRoute()}
          />
        </TestContextProvider>
      );

      const shareButton = screen.getByRole('button', { name: /share route/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText(/share options/i)).toBeInTheDocument();
        expect(screen.getByText(/copy link/i)).toBeInTheDocument();
      });
    });
  });
}); 