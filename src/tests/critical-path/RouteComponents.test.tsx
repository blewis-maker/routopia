/// <reference types="jest" />
import { vi, Mock, beforeAll, afterAll } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { TestContextProvider, mockCanvasContext2D, mockRAF } from '../utils/TestContextProvider';
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
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const simulateMouseEvent = (
    element: HTMLElement,
    eventType: string,
    x: number = 0,
    y: number = 0,
    button: number = 0
  ) => {
    const event = new MouseEvent(eventType, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button,
      buttons: button === 0 ? 1 : 0,
      screenX: x,
      screenY: y
    });
    element.dispatchEvent(event);
  };

  describe('RouteDrawing', () => {
    beforeEach(() => {
      mockRAF.mockClear();
      Object.values(mockCanvasContext2D)
        .filter((value): value is Mock => typeof value === 'function' && 'mockReset' in value)
        .forEach(mockFn => mockFn.mockReset());
    });

    it('handles canvas drawing without map instance', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawError = vi.fn();
      const onDrawCancel = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawError={onDrawError}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      // Start drawing
      simulateMouseEvent(canvas!, 'mousedown', 100, 100);
      await act(async () => {
        vi.advanceTimersByTime(16);
        await Promise.resolve();
      });

      // Move while drawing
      simulateMouseEvent(canvas!, 'mousemove', 150, 150);
      await act(async () => {
        vi.advanceTimersByTime(16);
        await Promise.resolve();
      });

      // Complete drawing
      simulateMouseEvent(canvas!, 'mouseup', 150, 150);
      await act(async () => {
        vi.advanceTimersByTime(16);
        await Promise.resolve();
      });

      // Run any remaining timers
      await act(async () => {
        vi.runAllTimers();
        await Promise.resolve();
      });

      // Check the results
      expect(mockCanvasContext2D.beginPath).toHaveBeenCalled();
      expect(mockCanvasContext2D.moveTo).toHaveBeenCalledWith(100, 100);
      expect(mockCanvasContext2D.lineTo).toHaveBeenCalledWith(150, 150);
      expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
      expect(onDrawProgress).toHaveBeenCalledWith([[100, 100], [150, 150]]);
      expect(onDrawComplete).toHaveBeenCalledWith([[100, 100], [150, 150]]);
    });

    it('handles map instance errors gracefully', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawError = vi.fn();
      const onDrawCancel = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing
            activityType="walk"
            mapInstance={mockMap}
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawError={onDrawError}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      // Simulate error by making map.project throw
      mockMap.project.mockImplementationOnce(() => {
        throw new Error('Map error');
      });

      await simulateMouseEvent(canvas, 'mousedown', 100, 100);

      await waitFor(() => {
        expect(onDrawError).toHaveBeenCalledWith(expect.any(Error));
        expect(onDrawComplete).not.toHaveBeenCalled();
        expect(mockCanvasContext2D.clearRect).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('handles mouse events correctly', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawError = vi.fn();
      const onDrawCancel = vi.fn();

      const { container } = render(
        <TestContextProvider>
          <RouteDrawing
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawError={onDrawError}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = getCanvas(container);

      // Start drawing
      await simulateMouseEvent(canvas, 'mousedown', 100, 100);

      await waitFor(() => {
        expect(mockCanvasContext2D.beginPath).toHaveBeenCalled();
        expect(mockCanvasContext2D.moveTo).toHaveBeenCalledWith(100, 100);
        expect(onDrawProgress).toHaveBeenCalledWith([[100, 100]]);
      }, { timeout: 1000 });

      // Move while drawing
      await simulateMouseEvent(canvas, 'mousemove', 150, 150);

      await waitFor(() => {
        expect(mockCanvasContext2D.lineTo).toHaveBeenCalledWith(150, 150);
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
        expect(onDrawProgress).toHaveBeenCalledWith([[100, 100], [150, 150]]);
      }, { timeout: 1000 });

      // Complete drawing
      await simulateMouseEvent(canvas, 'mouseup', 150, 150);

      await waitFor(() => {
        expect(onDrawComplete).toHaveBeenCalledWith([[100, 100], [150, 150]]);
      }, { timeout: 1000 });
    });

    describe('Animation Frame Handling', () => {
      it('validates frame timing for smooth animations', async () => {
        const onDrawProgress = vi.fn();
        const onDrawComplete = vi.fn();
        const onDrawError = vi.fn();
        const onDrawCancel = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing
              activityType="walk"
              onDrawProgress={onDrawProgress}
              onDrawComplete={onDrawComplete}
              onDrawError={onDrawError}
              onDrawCancel={onDrawCancel}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);

        // Simulate multiple mouse moves with timing
        for (let i = 0; i < 5; i++) {
          await simulateMouseEvent(canvas, 'mousemove', 150 + i * 10, 150 + i * 10);
          await act(async () => {
            vi.advanceTimersByTime(16); // ~60fps
          });
        }

        await waitFor(() => {
          expect(mockRAF).toHaveBeenCalled();
          expect(onDrawProgress).toHaveBeenCalled();
          expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
        }, { timeout: 1000 });
      });
    });

    describe('Route Cancellation', () => {
      it('cancels route drawing on Escape key press', async () => {
        const onDrawProgress = vi.fn();
        const onDrawComplete = vi.fn();
        const onDrawError = vi.fn();
        const onDrawCancel = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing
              activityType="walk"
              onDrawProgress={onDrawProgress}
              onDrawComplete={onDrawComplete}
              onDrawError={onDrawError}
              onDrawCancel={onDrawCancel}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await simulateMouseEvent(canvas, 'mousemove', 150, 150);

        // Press Escape
        await act(async () => {
          fireEvent.keyDown(document, { key: 'Escape' });
          vi.advanceTimersByTime(100);
        });

        await waitFor(() => {
          expect(onDrawCancel).toHaveBeenCalled();
          expect(onDrawComplete).not.toHaveBeenCalled();
          expect(mockCanvasContext2D.clearRect).toHaveBeenCalled();
        }, { timeout: 1000 });
      });

      it('cancels route drawing on right click', async () => {
        const onDrawProgress = vi.fn();
        const onDrawComplete = vi.fn();
        const onDrawError = vi.fn();
        const onDrawCancel = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing
              activityType="walk"
              onDrawProgress={onDrawProgress}
              onDrawComplete={onDrawComplete}
              onDrawError={onDrawError}
              onDrawCancel={onDrawCancel}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Start drawing
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await simulateMouseEvent(canvas, 'mousemove', 150, 150);

        // Right click
        await act(async () => {
          const event = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            button: 2,
            buttons: 2,
            clientX: 150,
            clientY: 150
          });
          canvas.dispatchEvent(event);
          vi.advanceTimersByTime(100);
        });

        await waitFor(() => {
          expect(onDrawCancel).toHaveBeenCalled();
          expect(onDrawComplete).not.toHaveBeenCalled();
          expect(mockCanvasContext2D.clearRect).toHaveBeenCalled();
        }, { timeout: 1000 });
      });
    });

    describe('Complex Interaction Sequences', () => {
      it('handles multi-point route with intersections', async () => {
        const onDrawProgress = vi.fn();
        const onDrawComplete = vi.fn();
        const onDrawError = vi.fn();
        const onDrawCancel = vi.fn();

        const { container } = render(
          <TestContextProvider>
            <RouteDrawing
              activityType="walk"
              onDrawProgress={onDrawProgress}
              onDrawComplete={onDrawComplete}
              onDrawError={onDrawError}
              onDrawCancel={onDrawCancel}
            />
          </TestContextProvider>
        );

        const canvas = getCanvas(container);

        // Draw a complex path with intersections
        await simulateMouseEvent(canvas, 'mousedown', 100, 100);
        await simulateMouseEvent(canvas, 'mousemove', 200, 100);
        await simulateMouseEvent(canvas, 'mousemove', 200, 200);
        await simulateMouseEvent(canvas, 'mousemove', 100, 200);
        await simulateMouseEvent(canvas, 'mousemove', 100, 100);
        await simulateMouseEvent(canvas, 'mouseup', 100, 100);

        await waitFor(() => {
          expect(mockCanvasContext2D.beginPath).toHaveBeenCalled();
          expect(mockCanvasContext2D.moveTo).toHaveBeenCalledWith(100, 100);
          expect(mockCanvasContext2D.lineTo).toHaveBeenCalledTimes(5);
          expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
          expect(onDrawComplete).toHaveBeenCalledWith([
            [100, 100],
            [200, 100],
            [200, 200],
            [100, 200],
            [100, 100]
          ]);
        }, { timeout: 1000 });
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
