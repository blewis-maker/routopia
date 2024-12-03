import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestContextProvider } from '../utils/TestContextProvider';
import { RouteDrawing } from '@/components/route/RouteDrawing';
import { RoutePreview } from '@/components/route/RoutePreview';
import { RouteInteractionPanel } from '@/components/route/RouteInteractionPanel';
import { RoutePreferences } from '@/components/route/RoutePreferences';
import { routeService } from '@/services/routeService';

// Mock the route service
vi.mock('@/services/routeService', () => ({
  routeService: {
    saveRoute: vi.fn().mockResolvedValue({ success: true }),
    getCurrentLocation: vi.fn().mockResolvedValue([0, 0])
  }
}));

describe('Critical - Route Components', () => {
  const mockMapInstance = {
    on: vi.fn(),
    off: vi.fn(),
    project: vi.fn().mockReturnValue({ x: 100, y: 100 })
  };

  describe('RouteDrawing', () => {
    it('handles drawing mode correctly', async () => {
      const onDrawComplete = vi.fn();

      await act(async () => {
        render(
          <TestContextProvider>
            <RouteDrawing 
              isDrawing={true}
              onDrawComplete={onDrawComplete}
              onDrawCancel={() => {}}
              mapInstance={mockMapInstance}
              activityType="walk"
            />
          </TestContextProvider>
        );
      });

      const canvas = screen.getByRole('application');
      
      // Simulate the drawing sequence
      await userEvent.click(canvas);
      
      // Get the mouseup handler that was registered
      const mouseupHandler = mockMapInstance.on.mock.calls.find(
        call => call[0] === 'mouseup'
      )?.[1];

      await act(async () => {
        if (mouseupHandler) {
          mouseupHandler({ 
            lngLat: { lng: 0, lat: 0 },
            preventDefault: () => {}
          });
        }
      });

      await waitFor(() => {
        expect(onDrawComplete).toHaveBeenCalled();
      });
    });
  });

  describe('RoutePreview', () => {
    test('shows route preview with controls', async () => {
      const onConfirm = vi.fn();
      const onEdit = vi.fn();
      const onCancel = vi.fn();

      render(
        <TestContextProvider>
          <RoutePreview
            points={[[0, 0], [1, 1]]}
            activityType="walk"
            isVisible={true}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
            mapInstance={mockMapInstance}
          />
        </TestContextProvider>
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const editButton = screen.getByRole('button', { name: /edit/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(confirmButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();

      await userEvent.click(confirmButton);
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  describe('RouteInteractionPanel', () => {
    const mockRoute = {
      id: 'test-route',
      waypoints: [
        { id: 'wp1', position: [0, 0], type: 'start', name: 'Start' },
        { id: 'wp2', position: [1, 1], type: 'end', name: 'End' }
      ],
      distance: 10,
      duration: 30,
      elevation: 100
    };

    test('handles waypoint operations', async () => {
      const onRouteUpdate = vi.fn();
      const onWaypointAdd = vi.fn();
      const onWaypointRemove = vi.fn();
      const onWaypointReorder = vi.fn();

      render(
        <TestContextProvider>
          <RouteInteractionPanel
            route={mockRoute}
            onRouteUpdate={onRouteUpdate}
            onWaypointAdd={onWaypointAdd}
            onWaypointRemove={onWaypointRemove}
            onWaypointReorder={onWaypointReorder}
          />
        </TestContextProvider>
      );

      // Test adding waypoint
      const addButton = screen.getByText(/add waypoint/i);
      await userEvent.click(addButton);
      expect(onWaypointAdd).toHaveBeenCalled();

      // Test waypoint list rendering
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('End')).toBeInTheDocument();
    });
  });

  describe('RoutePreferences', () => {
    test('updates preferences correctly', async () => {
      const onChange = vi.fn();
      const initialPreferences = {
        type: 'avoid' as const,
        options: {
          highways: false,
          tolls: true
        },
        restrictions: {
          maxElevation: 1000,
          maxDistance: 50
        }
      };

      render(
        <TestContextProvider>
          <RoutePreferences
            activityType="bike"
            preferences={initialPreferences}
            onChange={onChange}
          />
        </TestContextProvider>
      );

      // Test checkbox interaction
      const highwaysCheckbox = screen.getByText(/highways/i);
      await userEvent.click(highwaysCheckbox);

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({
          highways: true,
          tolls: true
        })
      }));
    });
  });
}); 