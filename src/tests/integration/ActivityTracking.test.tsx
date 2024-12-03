import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { ActivityTracker } from '@/components/ActivityTracker';
import { MetricsService } from '@/services/metrics/MetricsService';
import { LocationService } from '@/services/location/LocationService';
import type { 
  ActivityMetrics,
  TrackingState,
  LiveMetrics,
  ActivitySummary 
} from '@/types/activities';

describe('Activity Tracking Integration', () => {
  let metricsService: MetricsService;
  let locationService: LocationService;

  beforeEach(() => {
    metricsService = new MetricsService();
    locationService = new LocationService();
    vi.clearAllMocks();
  });

  describe('Activity Recording', () => {
    it('should start and stop activity tracking', async () => {
      const mockLocation = { latitude: 47.6062, longitude: -122.3321 };
      vi.spyOn(locationService, 'getCurrentPosition')
        .mockResolvedValue(mockLocation);

      render(
        <TestContextProvider>
          <ActivityTracker
            metricsService={metricsService}
            locationService={locationService}
          />
        </TestContextProvider>
      );

      // Start tracking
      fireEvent.click(screen.getByText('Start Activity'));
      
      await waitFor(() => {
        expect(screen.getByText('Recording...')).toBeInTheDocument();
        expect(screen.getByTestId('tracking-indicator')).toHaveClass('active');
      });

      // Stop tracking
      fireEvent.click(screen.getByText('Stop'));
      
      await waitFor(() => {
        expect(screen.getByText('Activity Complete')).toBeInTheDocument();
        expect(screen.getByTestId('save-activity')).toBeInTheDocument();
      });
    });

    it('should handle tracking interruptions', async () => {
      vi.spyOn(locationService, 'getCurrentPosition')
        .mockRejectedValue(new Error('Location unavailable'));

      render(
        <TestContextProvider>
          <ActivityTracker
            metricsService={metricsService}
            locationService={locationService}
          />
        </TestContextProvider>
      );

      fireEvent.click(screen.getByText('Start Activity'));

      await waitFor(() => {
        expect(screen.getByText('Location Error')).toBeInTheDocument();
        expect(screen.getByText('Resume')).toBeInTheDocument();
      });
    });
  });

  describe('Basic Metrics Tracking', () => {
    it('should display real-time metrics', async () => {
      const mockMetrics: LiveMetrics = {
        duration: 300,
        distance: 1000,
        pace: '5:00 /km',
        elevation: {
          gain: 50,
          loss: 20
        }
      };

      vi.spyOn(metricsService, 'getLiveMetrics')
        .mockResolvedValue(mockMetrics);

      render(
        <TestContextProvider>
          <ActivityTracker
            metricsService={metricsService}
            locationService={locationService}
          />
        </TestContextProvider>
      );

      fireEvent.click(screen.getByText('Start Activity'));

      await waitFor(() => {
        expect(screen.getByText('1.0 km')).toBeInTheDocument();
        expect(screen.getByText('5:00 /km')).toBeInTheDocument();
        expect(screen.getByText('50m↑')).toBeInTheDocument();
      });
    });

    it('should calculate activity summary', async () => {
      const mockSummary: ActivitySummary = {
        totalDistance: 5000,
        totalDuration: 1800,
        averagePace: '6:00 /km',
        elevationGain: 150,
        elevationLoss: 100,
        calories: 450
      };

      vi.spyOn(metricsService, 'generateActivitySummary')
        .mockResolvedValue(mockSummary);

      render(
        <TestContextProvider>
          <ActivityTracker
            metricsService={metricsService}
            locationService={locationService}
          />
        </TestContextProvider>
      );

      // Complete activity
      fireEvent.click(screen.getByText('Start Activity'));
      fireEvent.click(screen.getByText('Stop'));

      await waitFor(() => {
        expect(screen.getByText('5.0 km')).toBeInTheDocument();
        expect(screen.getByText('30:00')).toBeInTheDocument();
        expect(screen.getByText('450 calories')).toBeInTheDocument();
      });
    });
  });

  describe('Activity History Integration', () => {
    it('should save completed activity to history', async () => {
      const saveSpy = vi.spyOn(metricsService, 'saveActivity');
      
      render(
        <TestContextProvider>
          <ActivityTracker
            metricsService={metricsService}
            locationService={locationService}
          />
        </TestContextProvider>
      );

      // Complete and save activity
      fireEvent.click(screen.getByText('Start Activity'));
      fireEvent.click(screen.getByText('Stop'));
      fireEvent.click(screen.getByText('Save Activity'));

      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalled();
        expect(screen.getByText('Activity Saved')).toBeInTheDocument();
      });
    });
  });
}); 