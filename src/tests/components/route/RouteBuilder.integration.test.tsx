import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteBuilder } from '@/components/route/RouteBuilder';
import { MockRouteService, createMockRouteResult } from '../../mocks/services/route/MockRouteServices';
import { RouteContext } from '@/contexts/RouteContext';
import { ActivityType } from '@/types/activity';
import { GeoPoint } from '@/types/geo';

jest.mock('@/hooks/useMap', () => ({
  useMap: () => ({
    setMarkers: jest.fn(),
    drawPath: jest.fn(),
    clearPath: jest.fn(),
    getCenter: () => ({ lat: 40.7128, lng: -74.0060 }),
    fitBounds: jest.fn()
  })
}));

describe('RouteBuilder Integration', () => {
  let mockRouteService: MockRouteService;

  const mockStartPoint: GeoPoint = { lat: 40.7128, lng: -74.0060 }; // NYC
  const mockEndPoint: GeoPoint = { lat: 40.7614, lng: -73.9776 }; // Central Park

  beforeEach(() => {
    mockRouteService = new MockRouteService();
  });

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <RouteContext.Provider value={{ routeService: mockRouteService }}>
        {ui}
      </RouteContext.Provider>
    );
  };

  describe('Activity Type Selection', () => {
    it('should allow selecting different activity types', async () => {
      renderWithContext(<RouteBuilder />);

      const activitySelect = screen.getByLabelText(/activity type/i);
      
      // Test WALK
      await userEvent.selectOptions(activitySelect, 'WALK');
      expect(activitySelect).toHaveValue('WALK');

      // Test RUN
      await userEvent.selectOptions(activitySelect, 'RUN');
      expect(activitySelect).toHaveValue('RUN');

      // Test BIKE
      await userEvent.selectOptions(activitySelect, 'BIKE');
      expect(activitySelect).toHaveValue('BIKE');

      // Test SKI
      await userEvent.selectOptions(activitySelect, 'SKI');
      expect(activitySelect).toHaveValue('SKI');
    });

    it('should update route preferences based on activity type', async () => {
      renderWithContext(<RouteBuilder />);

      // Select BIKE activity
      await userEvent.selectOptions(screen.getByLabelText(/activity type/i), 'BIKE');
      
      // Bike-specific preferences should appear
      expect(screen.getByLabelText(/prefer bike lanes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/avoid traffic/i)).toBeInTheDocument();

      // Select SKI activity
      await userEvent.selectOptions(screen.getByLabelText(/activity type/i), 'SKI');
      
      // Ski-specific preferences should appear
      expect(screen.getByLabelText(/snow conditions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/trail difficulty/i)).toBeInTheDocument();
    });
  });

  describe('Multi-Segment Route Creation', () => {
    it('should allow adding multiple waypoints', async () => {
      renderWithContext(<RouteBuilder />);

      const addWaypointButton = screen.getByText(/add waypoint/i);
      
      // Add two waypoints
      await userEvent.click(addWaypointButton);
      await userEvent.click(addWaypointButton);

      const waypointInputs = screen.getAllByPlaceholderText(/enter location/i);
      expect(waypointInputs).toHaveLength(4); // Start, 2 waypoints, End
    });

    it('should create routes with mixed activity types', async () => {
      const mockResult = createMockRouteResult(3);
      mockRouteService.setMockRouteResult(mockResult);

      renderWithContext(<RouteBuilder />);

      // Add a waypoint
      await userEvent.click(screen.getByText(/add waypoint/i));

      // Set locations
      const locationInputs = screen.getAllByPlaceholderText(/enter location/i);
      await userEvent.type(locationInputs[0], 'New York');
      await userEvent.type(locationInputs[1], 'Central Park');
      await userEvent.type(locationInputs[2], 'Times Square');

      // Set different activity types for segments
      const activitySelects = screen.getAllByLabelText(/segment.*activity/i);
      await userEvent.selectOptions(activitySelects[0], 'WALK');
      await userEvent.selectOptions(activitySelects[1], 'BIKE');

      // Create route
      await userEvent.click(screen.getByText(/create route/i));

      // Verify route creation
      await waitFor(() => {
        expect(screen.getByText(/route created/i)).toBeInTheDocument();
      });
    });
  });

  describe('Route Optimization', () => {
    it('should apply optimization preferences', async () => {
      renderWithContext(<RouteBuilder />);

      // Select optimization preferences
      await userEvent.click(screen.getByLabelText(/avoid hills/i));
      await userEvent.click(screen.getByLabelText(/prefer scenic routes/i));
      
      // Set safety as priority
      await userEvent.selectOptions(
        screen.getByLabelText(/optimization priority/i),
        'SAFETY'
      );

      // Create route
      await userEvent.click(screen.getByText(/create route/i));

      // Verify optimization application
      await waitFor(() => {
        expect(screen.getByText(/route optimized for safety/i)).toBeInTheDocument();
      });
    });

    it('should handle weather-based optimization', async () => {
      renderWithContext(<RouteBuilder />);

      // Enable weather optimization
      await userEvent.click(screen.getByLabelText(/consider weather/i));

      // Create route
      await userEvent.click(screen.getByText(/create route/i));

      // Verify weather consideration
      await waitFor(() => {
        expect(screen.getByText(/weather-optimized route/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error for invalid locations', async () => {
      renderWithContext(<RouteBuilder />);

      const locationInput = screen.getAllByPlaceholderText(/enter location/i)[0];
      await userEvent.type(locationInput, 'Invalid Location XYZ');

      await userEvent.click(screen.getByText(/create route/i));

      await waitFor(() => {
        expect(screen.getByText(/location not found/i)).toBeInTheDocument();
      });
    });

    it('should handle service unavailability gracefully', async () => {
      mockRouteService.createMultiSegmentRoute = jest.fn().mockRejectedValue(
        new Error('Service unavailable')
      );

      renderWithContext(<RouteBuilder />);

      await userEvent.click(screen.getByText(/create route/i));

      await waitFor(() => {
        expect(screen.getByText(/service temporarily unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      renderWithContext(<RouteBuilder />);

      // Focus first input
      const firstInput = screen.getAllByPlaceholderText(/enter location/i)[0];
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);

      // Tab to activity select
      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/activity type/i));

      // Tab to optimization options
      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/optimization priority/i));
    });

    it('should announce route creation status', async () => {
      renderWithContext(<RouteBuilder />);

      await userEvent.click(screen.getByText(/create route/i));

      await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toHaveTextContent(/route created successfully/i);
      });
    });
  });
}); 