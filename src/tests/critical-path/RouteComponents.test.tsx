import { vi } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { RouteDrawing } from '@/components/route/RouteDrawing';
import { RoutePreview } from '@/components/route/RoutePreview';
import { routeService } from '@/services/routeService';

// Mock the route service
vi.mock('@/services/routeService', () => ({
  routeService: {
    saveRoute: vi.fn().mockResolvedValue({ success: true }),
    getCurrentLocation: vi.fn().mockResolvedValue([0, 0])
  }
}));

describe('Critical - Route Components', () => {
  let mockContext;

  beforeEach(() => {
    vi.useFakeTimers();
    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      canvas: { 
        width: 800, 
        height: 600,
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      }
    };

    // Make mockContext accessible via getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('RouteDrawing', () => {
    it('initializes canvas correctly', async () => {
      const mockMapInstance = {
        on: vi.fn(),
        off: vi.fn(),
        project: vi.fn(),
        unproject: vi.fn()
      };

      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true}
            onDrawComplete={() => {}}
            onDrawCancel={() => {}}
            mapInstance={mockMapInstance}
            activityType="walk"
            snapToRoads={false}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('application').querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('route-drawing-canvas');
    });

    it('handles mouse events correctly', async () => {
      const mockMapInstance = {
        on: vi.fn(),
        off: vi.fn(),
        project: vi.fn(coords => ({
          x: coords[0] * 100,
          y: coords[1] * 100
        })),
        unproject: vi.fn(point => [point.x / 100, point.y / 100])
      };

      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true}
            onDrawComplete={() => {}}
            onDrawCancel={() => {}}
            mapInstance={mockMapInstance}
            activityType="walk"
            snapToRoads={false}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('application').querySelector('canvas');
      
      // Initial mouse down
      await act(async () => {
        fireEvent.mouseDown(canvas, { 
          clientX: 100, 
          clientY: 100, 
          buttons: 1,
          bubbles: true 
        });
        await vi.runAllTimersAsync();
      });

      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();

      // Mouse move
      await act(async () => {
        fireEvent.mouseMove(canvas, { 
          clientX: 200, 
          clientY: 200, 
          buttons: 1,
          bubbles: true 
        });
        await vi.runAllTimersAsync();
      });

      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('completes drawing on mouse up', async () => {
      const onDrawComplete = vi.fn();
      const mockMapInstance = {
        on: vi.fn(),
        off: vi.fn(),
        project: vi.fn(coords => ({
          x: coords[0] * 100,
          y: coords[1] * 100
        })),
        unproject: vi.fn(point => [point.x / 100, point.y / 100])
      };

      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true}
            onDrawComplete={onDrawComplete}
            onDrawCancel={() => {}}
            mapInstance={mockMapInstance}
            activityType="walk"
            snapToRoads={false}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('application').querySelector('canvas');

      // Complete drawing sequence
      await act(async () => {
        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100, buttons: 1, bubbles: true });
        await vi.runAllTimersAsync();
        
        fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200, buttons: 1, bubbles: true });
        await vi.runAllTimersAsync();
        
        fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200, bubbles: true });
        await vi.runAllTimersAsync();
      });

      expect(onDrawComplete).toHaveBeenCalled();
    });
  });

  describe('RoutePreview', () => {
    it('shows route preview with controls', async () => {
      const onEdit = vi.fn();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const route = [[0, 0], [1, 1], [2, 2]];

      await act(async () => {
        render(
          <RoutePreview
            route={route}
            activityType="walk"
            onEdit={onEdit}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={true}
          />
        );
      });

      // Verify controls are rendered
      expect(screen.getByLabelText('Edit route')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm route')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel route')).toBeInTheDocument();
    });
  });
}); 
