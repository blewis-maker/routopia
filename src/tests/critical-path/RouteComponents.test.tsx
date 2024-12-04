/// <reference types="jest" />
import { vi, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TestContextProvider, mockCanvasContext2D, mockRAF } from '../utils/TestContextProvider';
import { RouteDrawing } from '@/components/route/RouteDrawing';

describe('Critical - Route Components', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockRAF.mockClear();
    Object.values(mockCanvasContext2D)
      .filter((value): value is Mock => typeof value === 'function' && 'mockReset' in value)
      .forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('RouteDrawing', () => {
    beforeEach(() => {
      console.log('Setting up drawing component...');
      mockCanvasContext2D.resetState();
    });

    const createMouseEvent = (type: string, x: number, y: number, button = 0, buttons = 1) => {
      return new MouseEvent(type, {
        clientX: x,
        clientY: y,
        button,
        buttons,
        bubbles: true,
        cancelable: true
      });
    };

    const simulateDrawingPoint = async (canvas: HTMLCanvasElement, x: number, y: number) => {
      canvas.dispatchEvent(createMouseEvent('mousemove', x, y));
      await vi.advanceTimersByTimeAsync(16); // One frame
    };

    it('handles canvas drawing without map instance', async () => {
      console.log('Starting test...');
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        expect(mockCanvasContext2D.beginPath).toHaveBeenCalled();
        expect(mockCanvasContext2D.moveTo).toHaveBeenCalledWith(100, 100);
        expect(onDrawProgress).toHaveBeenCalledWith([[100, 100]]);
      }, { timeout: 1000 });
    });

    it('handles multi-point route with intersections', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      
      // Start drawing
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      await vi.advanceTimersByTimeAsync(16);

      // Draw a route that intersects with itself
      await simulateDrawingPoint(canvas, 200, 100); // →
      await simulateDrawingPoint(canvas, 200, 200); // ↓
      await simulateDrawingPoint(canvas, 100, 200); // ←
      await simulateDrawingPoint(canvas, 100, 100); // ↑ (back to start)
      await simulateDrawingPoint(canvas, 150, 150); // × (intersection point)

      // End drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 150, 150));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        const lastCall = onDrawProgress.mock.lastCall[0];
        expect(lastCall).toHaveLength(6); // Start + 4 points + intersection
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
        expect(onDrawComplete).toHaveBeenCalled();
      });
    });

    it('handles combined keyboard and mouse interactions', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      
      // Start drawing
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      await vi.advanceTimersByTimeAsync(16);

      // Draw while holding Shift (should snap to horizontal/45° angles)
      fireEvent.keyDown(window, { key: 'Shift', keyCode: 16 });
      await vi.advanceTimersByTimeAsync(16); // Wait for shift key state to update
      
      // First point should snap to horizontal (very small vertical deviation)
      await simulateDrawingPoint(canvas, 150, 105); // Only 5px vertical deviation
      await vi.advanceTimersByTimeAsync(16);
      
      // Second point should snap to 45°
      await simulateDrawingPoint(canvas, 200, 200);
      await vi.advanceTimersByTimeAsync(16);
      
      fireEvent.keyUp(window, { key: 'Shift', keyCode: 16 });
      await vi.advanceTimersByTimeAsync(16);

      // Draw normally
      await simulateDrawingPoint(canvas, 250, 220);
      await vi.advanceTimersByTimeAsync(16);
      
      // Complete drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 250, 220));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        const points = onDrawProgress.mock.lastCall[0];
        expect(points).toHaveLength(4);
        
        const [start, horizontal, diagonal, end] = points;
        console.log('Points:', {
          start,
          horizontal,
          diagonal,
          end,
          horizontal_delta: {
            dx: horizontal[0] - start[0],
            dy: horizontal[1] - start[1]
          },
          diagonal_delta: {
            dx: diagonal[0] - start[0],
            dy: diagonal[1] - start[1]
          }
        });
        
        // Verify horizontal snapping
        expect(horizontal[1]).toBe(start[1]); // Y should be same as start when horizontal
        
        // Verify 45° angle snapping
        const dx = diagonal[0] - start[0];
        const dy = diagonal[1] - start[1];
        expect(Math.abs(dx)).toBe(Math.abs(dy)); // Changes in x and y should be equal for 45°
      }, { timeout: 2000 });
    });

    it('handles edge cases and error conditions', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      const onDrawCancel = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
            onDrawCancel={onDrawCancel}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      
      // Test rapid mouse events
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      for (let i = 0; i < 10; i++) {
        canvas.dispatchEvent(createMouseEvent('mousemove', 100 + i * 10, 100));
      }
      await vi.advanceTimersByTimeAsync(16);

      // Test out-of-bounds coordinates
      await simulateDrawingPoint(canvas, -100, -100);
      await simulateDrawingPoint(canvas, 1000, 1000);

      // Test invalid button states
      canvas.dispatchEvent(createMouseEvent('mousedown', 150, 150, 1)); // Right button
      await vi.advanceTimersByTimeAsync(16);

      // Test mouseup without mousedown
      canvas.dispatchEvent(createMouseEvent('mouseup', 200, 200));
      await vi.advanceTimersByTimeAsync(16);

      await waitFor(() => {
        // Should handle rapid events by throttling
        expect(onDrawProgress).toHaveBeenCalled();
        // Should clamp out-of-bounds coordinates
        const points = onDrawProgress.mock.lastCall[0];
        points.forEach(([x, y]) => {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(800);
          expect(y).toBeLessThanOrEqual(600);
        });
      });
    });

    it('handles concurrent event sequences', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="walk"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      
      // Simulate multiple rapid interactions
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      
      // Simulate concurrent mousemove and keydown events
      const events = [
        createMouseEvent('mousemove', 150, 150),
        new KeyboardEvent('keydown', { key: 'Shift' }),
        createMouseEvent('mousemove', 200, 200),
        new KeyboardEvent('keyup', { key: 'Shift' }),
        createMouseEvent('mousemove', 250, 250)
      ];

      // Dispatch events in rapid succession
      events.forEach(event => {
        canvas.dispatchEvent(event);
      });

      await vi.advanceTimersByTimeAsync(16);
      
      // Complete the drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 250, 250));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        expect(onDrawProgress).toHaveBeenCalled();
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
        expect(onDrawComplete).toHaveBeenCalled();
        
        // Verify the events were processed in the correct order
        const points = onDrawProgress.mock.lastCall[0];
        expect(points.length).toBeGreaterThan(1);
        expect(points[points.length - 1]).toEqual([250, 250]);
      });
    });
  });
});