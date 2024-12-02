import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { mockGenerators } from '../utils/mockGenerators';
import { RouteVisualization } from '../../components/RouteVisualization';
import type { RouteVisualizationProps } from '../../types/maps';

describe('RouteVisualization Integration', () => {
  const mockRoute = mockGenerators.createMockRoute();
  const mockProps: RouteVisualizationProps = {
    activityType: 'hiking',
    showTraffic: true,
    showAlternatives: true,
    style: {
      color: '#FF5733',
      width: 3,
      opacity: 0.8
    }
  };

  beforeEach(() => {
    // Reset mocks and provide fresh context
    vi.clearAllMocks();
  });

  describe('Route Rendering', () => {
    it('should render the main route path correctly', async () => {
      render(
        <TestContextProvider>
          <RouteVisualization 
            route={mockRoute} 
            {...mockProps} 
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        const routePath = screen.getByTestId('route-path');
        expect(routePath).toBeInTheDocument();
        expect(routePath).toHaveAttribute('d'); // SVG path data
        expect(routePath).toHaveStyle({
          stroke: mockProps.style.color,
          strokeWidth: mockProps.style.width
        });
      });
    });

    it('should display route metrics', async () => {
      render(
        <TestContextProvider>
          <RouteVisualization 
            route={mockRoute} 
            {...mockProps} 
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/5.0 km/)).toBeInTheDocument();
        expect(screen.getByText(/1:00 hr/)).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    it('should toggle traffic overlay when traffic button is clicked', async () => {
      render(
        <TestContextProvider>
          <RouteVisualization 
            route={mockRoute} 
            {...mockProps} 
          />
        </TestContextProvider>
      );

      const trafficButton = screen.getByRole('button', { name: /traffic/i });
      
      // Initial state
      expect(screen.getByTestId('traffic-overlay')).toBeVisible();
      
      // Toggle off
      fireEvent.click(trafficButton);
      await waitFor(() => {
        expect(screen.getByTestId('traffic-overlay')).not.toBeVisible();
      });
      
      // Toggle on
      fireEvent.click(trafficButton);
      await waitFor(() => {
        expect(screen.getByTestId('traffic-overlay')).toBeVisible();
      });
    });

    it('should show alternative routes when enabled', async () => {
      const mockAlternatives = [
        mockGenerators.createMockRoute(),
        mockGenerators.createMockRoute()
      ];

      render(
        <TestContextProvider>
          <RouteVisualization 
            route={mockRoute}
            alternatives={mockAlternatives}
            {...mockProps} 
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        const alternativeRoutes = screen.getAllByTestId('alternative-route');
        expect(alternativeRoutes).toHaveLength(2);
      });
    });
  });

  describe('Elevation Profile', () => {
    it('should render elevation profile when route has elevation data', async () => {
      const routeWithElevation = {
        ...mockRoute,
        elevation: [
          { distance: 0, elevation: 100, grade: 0 },
          { distance: 2500, elevation: 300, grade: 8 },
          { distance: 5000, elevation: 200, grade: -4 }
        ]
      };

      render(
        <TestContextProvider>
          <RouteVisualization 
            route={routeWithElevation} 
            {...mockProps} 
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        const elevationProfile = screen.getByTestId('elevation-profile');
        expect(elevationProfile).toBeInTheDocument();
        expect(screen.getByText(/200m elevation gain/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when route data is invalid', async () => {
      const invalidRoute = {
        ...mockRoute,
        geometry: null
      };

      render(
        <TestContextProvider>
          <RouteVisualization 
            route={invalidRoute} 
            {...mockProps} 
          />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/unable to display route/i)).toBeInTheDocument();
      });
    });
  });
}); 