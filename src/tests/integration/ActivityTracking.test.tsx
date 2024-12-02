import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { mockGenerators } from '../utils/mockGenerators';
import { ActivityTracker } from '../../components/ActivityTracker';
import type { ActivityDetails } from '../../types/activities-enhanced';

describe('ActivityTracking Integration', () => {
  const mockActivity: ActivityDetails = {
    type: 'hiking',
    metrics: {
      speed: {
        min: 2,
        max: 8,
        average: 4,
        unit: 'km/h'
      },
      elevation: {
        minGain: 0,
        maxGain: 1000,
        preferredGain: 500,
        unit: 'm'
      },
      duration: {
        min: 30,
        max: 240,
        preferred: 120,
        unit: 'minutes'
      }
    },
    requirements: {
      fitness: 'intermediate',
      technical: 'medium',
      equipment: ['hiking_boots', 'water_bottle'],
      season: ['spring', 'summer', 'fall']
    },
    constraints: {
      weather: {
        maxWind: 30,
        maxTemp: 30,
        minTemp: 5,
        conditions: ['clear', 'cloudy']
      },
      daylight: {
        required: true,
        minimumHours: 4
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Activity Recording', () => {
    it('should start and stop activity recording', async () => {
      render(
        <TestContextProvider>
          <ActivityTracker initialActivity={mockActivity} />
        </TestContextProvider>
      );

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/recording/i)).toBeInTheDocument();
        expect(screen.getByTestId('timer')).toBeInTheDocument();
      });

      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText(/summary/i)).toBeInTheDocument();
      });
    });

    it('should track real-time metrics', async () => {
      const mockMetrics = {
        speed: 5.2,
        elevation: 320,
        duration: 45,
        distance: 3.8
      };

      vi.mock('../../services/tracking', () => ({
        getRealtimeMetrics: () => mockMetrics
      }));

      render(
        <TestContextProvider>
          <ActivityTracker initialActivity={mockActivity} />
        </TestContextProvider>
      );

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/5.2 km\/h/)).toBeInTheDocument();
        expect(screen.getByText(/320m/)).toBeInTheDocument();
        expect(screen.getByText(/3.8 km/)).toBeInTheDocument();
      });
    });
  });

  describe('Environmental Conditions', () => {
    it('should display weather warnings when conditions exceed constraints', async () => {
      const mockWeather = {
        temperature: 35, // Exceeds maxTemp
        windSpeed: 35,   // Exceeds maxWind
        condition: 'rain' // Not in allowed conditions
      };

      vi.mock('../../services/weather', () => ({
        getCurrentWeather: () => mockWeather
      }));

      render(
        <TestContextProvider>
          <ActivityTracker initialActivity={mockActivity} />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/temperature warning/i)).toBeInTheDocument();
        expect(screen.getByText(/wind warning/i)).toBeInTheDocument();
        expect(screen.getByText(/weather condition warning/i)).toBeInTheDocument();
      });
    });

    it('should check daylight requirements', async () => {
      const mockDaylight = {
        isDaytime: false,
        remainingDaylight: 2 // Less than minimumHours
      };

      vi.mock('../../services/daylight', () => ({
        getDaylightInfo: () => mockDaylight
      }));

      render(
        <TestContextProvider>
          <ActivityTracker initialActivity={mockActivity} />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/insufficient daylight/i)).toBeInTheDocument();
      });
    });
  });

  describe('Activity Summary', () => {
    it('should generate accurate activity summary', async () => {
      const completedActivity = {
        ...mockActivity,
        metrics: {
          ...mockActivity.metrics,
          actual: {
            distance: 8.5,
            duration: 125,
            elevationGain: 450,
            averageSpeed: 4.8
          }
        }
      };

      render(
        <TestContextProvider>
          <ActivityTracker 
            initialActivity={mockActivity}
            onComplete={() => completedActivity}
          />
        </TestContextProvider>
      );

      // Complete activity
      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);
      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText(/8.5 km/)).toBeInTheDocument();
        expect(screen.getByText(/2:05 hours/)).toBeInTheDocument();
        expect(screen.getByText(/450m elevation gain/)).toBeInTheDocument();
        expect(screen.getByText(/4.8 km\/h/)).toBeInTheDocument();
      });
    });
  });
}); 