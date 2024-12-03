/// <reference types="jest" />
import { vi, Mock } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { TestContextProvider, mockCanvasContext } from '../utils/TestContextProvider';
import { RouteDrawing } from '@/components/route/RouteDrawing';
import { RoutePreview } from '@/components/route/RoutePreview';
import { routeService } from '@/services/routeService';
import type { ActivityType } from '@/types/routes';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { ErrorBoundary } from '../utils/ErrorBoundary';
import mapboxgl from 'mapbox-gl';

// Mock the route service
vi.mock('@/services/routeService', () => ({
  routeService: {
    saveRoute: vi.fn().mockResolvedValue({ success: true }),
    getCurrentLocation: vi.fn().mockResolvedValue([0, 0])
  }
}));

describe('Critical - Route Components', () => {
  beforeEach(() => {
    // Reset all mock functions
    Object.entries(mockCanvasContext).forEach(([key, value]) => {
      if (value && typeof value === 'function' && 'mockClear' in value) {
        (value as Mock).mockClear();
      }
    });

    // Set up canvas dimensions
    mockCanvasContext.canvas.width = 800;
    mockCanvasContext.canvas.height = 600;

    // Mock offsetWidth/offsetHeight
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 600 });
  });

  afterEach(() => {
    // Clean up mocks
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('RouteDrawing', () => {
    const mockMapInstance = {
      project: vi.fn((coords) => ({ x: coords[0], y: coords[1] })),
      unproject: vi.fn((point) => ({ lng: point.x, lat: point.y }))
    } as unknown as mapboxgl.Map;

    // Helper function to clear specific mocks
    const clearMocks = (...mocks: Mock[]) => {
      mocks.forEach(mock => mock.mockClear());
    };

    const getCanvas = (container: HTMLElement): HTMLCanvasElement => {
      const canvas = container.querySelector('canvas');
      if (!canvas) throw new Error('Canvas not found');
      return canvas;
    };

    const simulateMouseEvent = async (
      canvas: HTMLCanvasElement,
      eventType: 'mousedown' | 'mousemove' | 'mouseup',
      x: number,
      y: number,
      buttons = 1
    ) => {
      await act(async () => {
        fireEvent[eventType](canvas, {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          buttons,
          button: 0,
          screenX: x,
          screenY: y,
          pageX: x,
          pageY: y
        });
      });
    };

    const simulateContextMenu = async (canvas: HTMLCanvasElement) => {
      await act(async () => {
        fireEvent.contextMenu(canvas, {
          bubbles: true,
          cancelable: true,
          button: 2,
          buttons: 2
        });
      });
    };

    test('handles canvas drawing without map instance', async () => {
      const onDrawComplete = vi.fn();
      const onDrawProgress = vi.fn();
      const onDrawError = vi.fn();
      const onDrawCancel = vi.fn();
      
      const { container } = render(
        <TestContextProvider>
          <RouteDrawing 
            activityType="walk"
            isDrawing={true}
            onDrawComplete={onDrawComplete}
            onDrawProgress={onDrawProgress}
            onDrawError={onDrawError}
            onDrawCancel={onDrawCancel}
            snapToRoads={false}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      // Start drawing
      await simulateMouseEvent(canvas, 'mousedown', 100, 100);

      // Verify initial drawing state
      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.moveTo).toHaveBeenCalledWith(100, 100);
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100]]);

      // Continue drawing
      await simulateMouseEvent(canvas, 'mousemove', 150, 150);

      expect(mockCanvasContext.lineTo).toHaveBeenCalledWith(150, 150);
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100], [150, 150]]);

      // Complete drawing
      await simulateMouseEvent(canvas, 'mouseup', 150, 150);

      expect(onDrawComplete).toHaveBeenCalledWith([
        [100, 100],
        [150, 150]
      ]);
      expect(canvas.parentElement).toHaveAttribute('data-drawing-state', 'idle');
    });

    test('handles map instance errors gracefully', async () => {
      const onDrawError = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing 
            activityType="walk"
            isDrawing={true}
            onDrawComplete={onDrawComplete}
            onDrawError={onDrawError}
            onDrawCancel={onDrawCancel}
            snapToRoads={true}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      await simulateMouseEvent(canvas, 'mousedown', 100, 100);

      expect(onDrawError).toHaveBeenCalledWith(expect.any(Error));
      expect(onDrawComplete).not.toHaveBeenCalled();
      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
    });

    test('handles mouse events correctly', async () => {
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();
      const onDrawProgress = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing 
            activityType="walk"
            isDrawing={true}
            onDrawComplete={onDrawComplete}
            onDrawCancel={onDrawCancel}
            onDrawProgress={onDrawProgress}
            snapToRoads={false}
            mapInstance={mockMapInstance}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      // First point
      await simulateMouseEvent(canvas, 'mousedown', 100, 100);

      expect(mockCanvasContext.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext.moveTo).toHaveBeenCalledWith(100, 100);
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100]]);

      // Second point
      await simulateMouseEvent(canvas, 'mousemove', 150, 150);

      expect(mockCanvasContext.lineTo).toHaveBeenCalledWith(150, 150);
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100], [150, 150]]);

      // Third point and completion
      await simulateMouseEvent(canvas, 'mousemove', 200, 200);
      await simulateMouseEvent(canvas, 'mouseup', 200, 200);

      expect(mockCanvasContext.lineTo).toHaveBeenCalledWith(200, 200);
      expect(mockCanvasContext.stroke).toHaveBeenCalled();
      expect(onDrawComplete).toHaveBeenCalledWith([
        [100, 100],
        [150, 150],
        [200, 200]
      ]);
      expect(onDrawCancel).not.toHaveBeenCalled();
      expect(canvas.parentElement).toHaveAttribute('data-drawing-state', 'idle');
    });

    test('handles undo correctly', async () => {
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();
      const onDrawProgress = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing 
            activityType="walk"
            isDrawing={true}
            onDrawComplete={onDrawComplete}
            onDrawCancel={onDrawCancel}
            onDrawProgress={onDrawProgress}
            enableUndo={true}
            snapToRoads={false}
            mapInstance={mockMapInstance}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      // Draw points
      await simulateMouseEvent(canvas, 'mousedown', 100, 100);
      await simulateMouseEvent(canvas, 'mousemove', 150, 150);

      // Press 'z' with ctrl key to undo
      await act(async () => {
        fireEvent.keyDown(window, { 
          key: 'z',
          code: 'KeyZ',
          ctrlKey: true,
          bubbles: true
        });
      });

      expect(mockCanvasContext.clearRect).toHaveBeenCalled();
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100]]);
    });

    describe('Animation Frame Handling', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      test('validates frame timing for smooth animations', async () => {
        const onDrawProgress = vi.fn();
        
        const { container } = render(
          <TestContextProvider>
            <RouteDrawing 
              activityType="walk"
              isDrawing={true}
              onDrawComplete={vi.fn()}
              onDrawCancel={vi.fn()}
              onDrawProgress={onDrawProgress}
              snapToRoads={false}
              mapInstance={mockMapInstance}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await act(async () => {
          vi.advanceTimersByTime(16);
        });

        expect(mockCanvasContext.beginPath).toHaveBeenCalled();
        expect(mockCanvasContext.moveTo).toHaveBeenCalledWith(100, 100);

        // Draw multiple points with consistent timing
        const points = [
          [120, 120],
          [140, 140],
          [160, 160],
          [180, 180],
          [200, 200]
        ];

        for (const [x, y] of points) {
          await simulateMouseEvent(canvas, 'mousemove', x, y);
          await act(async () => {
            vi.advanceTimersByTime(16);
          });

          expect(mockCanvasContext.lineTo).toHaveBeenCalledWith(x, y);
        }

        await simulateMouseEvent(canvas, 'mouseup', 200, 200);
        await act(async () => {
          vi.advanceTimersByTime(16);
        });

        expect(mockCanvasContext.stroke).toHaveBeenCalled();
        expect(onDrawProgress).toHaveBeenCalled();
      });
    });

    describe('Complex Interaction Sequences', () => {
      test('handles multi-point route with intersections', async () => {
        const onDrawComplete = vi.fn();
        const onDrawProgress = vi.fn();
        const onDrawCancel = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing 
              activityType="walk"
              isDrawing={true}
              onDrawComplete={onDrawComplete}
              onDrawCancel={onDrawCancel}
              onDrawProgress={onDrawProgress}
              snapToRoads={false}
              mapInstance={mockMapInstance}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Draw a figure-8 pattern
        await simulateMouseEvent(canvas, 'mousedown', 150, 150);

        expect(mockCanvasContext.beginPath).toHaveBeenCalled();
        expect(mockCanvasContext.moveTo).toHaveBeenCalledWith(150, 150);

        // Draw the pattern
        const pattern = [
          [200, 100], // top right
          [200, 200], // bottom right
          [100, 200], // bottom left
          [100, 100], // top left
          [150, 150], // back to center
          [100, 100], // top left (second loop)
          [100, 200], // bottom left
          [200, 200], // bottom right
          [200, 100], // top right
          [150, 150]  // finish at center
        ];

        for (const [x, y] of pattern) {
          await simulateMouseEvent(canvas, 'mousemove', x, y);
          expect(mockCanvasContext.lineTo).toHaveBeenCalledWith(x, y);
        }

        await simulateMouseEvent(canvas, 'mouseup', 150, 150);

        expect(mockCanvasContext.stroke).toHaveBeenCalled();
        expect(onDrawComplete).toHaveBeenCalled();
        expect(onDrawCancel).not.toHaveBeenCalled();
      });
    });

    describe('Route Cancellation', () => {
      test('cancels route drawing on Escape key press', async () => {
        const onDrawCancel = vi.fn();
        const onDrawComplete = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing 
              activityType="walk"
              isDrawing={true}
              onDrawComplete={onDrawComplete}
              onDrawCancel={onDrawCancel}
              snapToRoads={false}
              mapInstance={mockMapInstance}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await simulateMouseEvent(canvas, 'mousemove', 150, 150);

        // Press Escape to cancel
        await act(async () => {
          fireEvent.keyDown(window, { 
            key: 'Escape',
            code: 'Escape',
            bubbles: true
          });
        });

        expect(onDrawCancel).toHaveBeenCalled();
        expect(onDrawComplete).not.toHaveBeenCalled();
        expect(mockCanvasContext.clearRect).toHaveBeenCalled();
        expect(canvas.parentElement).toHaveAttribute('data-drawing-state', 'idle');
      });

      test('cancels route drawing on right click', async () => {
        const onDrawCancel = vi.fn();
        const onDrawComplete = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing 
              activityType="walk"
              isDrawing={true}
              onDrawComplete={onDrawComplete}
              onDrawCancel={onDrawCancel}
              snapToRoads={false}
              mapInstance={mockMapInstance}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await simulateMouseEvent(canvas, 'mousemove', 150, 150);

        // Right click to cancel
        await simulateContextMenu(canvas);

        expect(onDrawCancel).toHaveBeenCalled();
        expect(onDrawComplete).not.toHaveBeenCalled();
        expect(mockCanvasContext.clearRect).toHaveBeenCalled();
        expect(canvas.parentElement).toHaveAttribute('data-drawing-state', 'idle');
      });
    });
  });

  describe('RoutePreview', () => {
    test('renders preview correctly', () => {
      const onConfirm = vi.fn();
      const onEdit = vi.fn();
      const onCancel = vi.fn();

      render(
        <TestContextProvider>
          <RoutePreview
            points={[[100, 100], [200, 200]]}
            activityType="walk"
            isVisible={true}
            onConfirm={onConfirm}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        </TestContextProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByLabelText('Route preview')).toBeInTheDocument();
    });
  });
}); 
