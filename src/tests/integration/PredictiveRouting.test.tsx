import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { PredictiveRoutingPanel } from '@/components/features/PredictiveRoutingPanel';
import { AdvancedFeatureImplementations } from '@/services/features/AdvancedFeatureImplementations';
import type { 
  Route,
  RoutePreferences,
  Coordinates,
  WeatherCondition,
  TrafficLevel
} from '@/types/routing';

describe('Predictive Routing Integration', () => {
  const mockRoute: Route = {
    path: [[0, 0], [1, 1]] as Coordinates[],
    duration: 1200,
    distance: 5000,
    conditions: {
      weather: 'clear' as WeatherCondition,
      traffic: 'light' as TrafficLevel
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should calculate route with all preferences enabled', async () => {
    const onRouteCalculated = vi.fn<[Route], void>();
    vi.spyOn(AdvancedFeatureImplementations, 'calculatePredictiveRoute')
      .mockResolvedValue(mockRoute);

    const { getByText, getByLabelText } = render(
      <PredictiveRoutingPanel onRouteCalculated={onRouteCalculated} />
    );

    // Set route points
    fireEvent.change(getByLabelText('Start Point'), {
      target: { value: '40.7128,-74.0060' }
    });
    fireEvent.change(getByLabelText('End Point'), {
      target: { value: '40.7614,-73.9776' }
    });

    // Enable all preferences
    fireEvent.click(getByLabelText('Use Historical Data'));
    fireEvent.click(getByLabelText('Use Weather Data'));
    fireEvent.click(getByLabelText('Use Traffic Prediction'));

    // Calculate route
    fireEvent.click(getByText('Calculate Route'));

    await waitFor(() => {
      expect(onRouteCalculated).toHaveBeenCalledWith(mockRoute);
    });
  });

  test('should handle calculation errors gracefully', async () => {
    const error = new Error('Failed to calculate route');
    vi.spyOn(AdvancedFeatureImplementations, 'calculatePredictiveRoute')
      .mockRejectedValue(error);

    const { getByText } = render(
      <PredictiveRoutingPanel onRouteCalculated={() => {}} />
    );

    fireEvent.click(getByText('Calculate Route'));

    await waitFor(() => {
      expect(getByText('Error: Failed to calculate route')).toBeInTheDocument();
    });
  });

  test('should update route when preferences change', async () => {
    const onRouteCalculated = vi.fn<[Route], void>();
    const calculateSpy = vi.spyOn(
      AdvancedFeatureImplementations,
      'calculatePredictiveRoute'
    ).mockResolvedValue(mockRoute);

    const { getByLabelText } = render(
      <PredictiveRoutingPanel onRouteCalculated={onRouteCalculated} />
    );

    // Toggle preferences
    fireEvent.click(getByLabelText('Use Historical Data'));
    
    await waitFor(() => {
      expect(calculateSpy).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Array),
        expect.objectContaining({ useHistoricalData: true } as RoutePreferences),
        expect.any(Date)
      );
    });
  });
}); 