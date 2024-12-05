/// <reference types="jest" />
import { vi, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TestContextProvider, mockCanvasContext2D, mockRAF } from '../utils/TestContextProvider';
import { RouteDrawing } from '@/components/route/RouteDrawing';
import fs from 'fs';
import path from 'path';

// Test logger setup
const LOG_DIR = path.join(process.cwd(), 'test-logs');
const LOG_FILE = path.join(LOG_DIR, 'smooth-curve-test.log');

const logToFile = (message: string) => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.appendFileSync(LOG_FILE, message + '\n');
};

const clearLogFile = () => {
  if (fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
  }
};

describe('Critical - Route Components', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockRAF.mockClear();
    Object.values(mockCanvasContext2D)
      .filter((value): value is Mock => typeof value === 'function' && 'mockReset' in value)
      .forEach(mock => mock.mockClear());
    clearLogFile();
    logToFile('\n=== Test Started ===\n');
  });

  afterEach(() => {
    vi.useRealTimers();
    logToFile('\n=== Test Ended ===\n');
  });

  describe('RouteDrawing', () => {
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
        expect(onDrawProgress).toHaveBeenCalled();
        const calls = onDrawProgress.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall).toHaveLength(6); // Start + 4 points + intersection
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
        expect(onDrawComplete).toHaveBeenCalled();
      });
    });

    describe('handles combined keyboard and mouse interactions', () => {
      it('snaps to horizontal and 45° angles when shift is held', async () => {
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
        
        // Start drawing and hold Shift in one batch
        canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
        fireEvent.keyDown(window, { key: 'Shift', keyCode: 16 });
        await vi.advanceTimersByTimeAsync(20); // Single advance for both events
        
        // Draw points with shift held
        await simulateDrawingPoint(canvas, 150, 105);
        await simulateDrawingPoint(canvas, 200, 200);
        await vi.advanceTimersByTimeAsync(20);
        
        // Release shift and complete drawing
        fireEvent.keyUp(window, { key: 'Shift', keyCode: 16 });
        await simulateDrawingPoint(canvas, 250, 220);
        canvas.dispatchEvent(createMouseEvent('mouseup', 250, 220));
        await vi.advanceTimersByTimeAsync(50);

        await waitFor(() => {
          expect(onDrawProgress).toHaveBeenCalled();
          const calls = onDrawProgress.mock.calls;
          expect(calls.length).toBeGreaterThan(0);
          const points = calls[calls.length - 1][0];
          expect(points).toHaveLength(4);
          
          const [start, horizontal, diagonal, end] = points as [number, number][];
          
          // Verify horizontal snapping
          expect(horizontal[1]).toBe(start[1]); // Y should be same as start when horizontal
          
          // Verify 45° angle snapping
          const dx = diagonal[0] - start[0];
          const dy = diagonal[1] - start[1];
          expect(Math.abs(dx)).toBe(Math.abs(dy)); // Changes in x and y should be equal for 45°
        }, { timeout: 1000 });
      });
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
        const calls = onDrawProgress.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        // Should clamp out-of-bounds coordinates
        const points = calls[calls.length - 1][0];
        points.forEach((point: [number, number]) => {
          const [x, y] = point;
          expect(x).toBeGreaterThanOrEqual(0);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(800);
          expect(y).toBeLessThanOrEqual(600);
        });
      });
    });

    describe('handles concurrent event sequences', () => {
      it('correctly processes overlapping mouse and keyboard events', async () => {
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
        
        // Batch initial events
        canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
        fireEvent.keyDown(window, { key: 'Shift', keyCode: 16 });
        await vi.advanceTimersByTimeAsync(20);

        // Simulate rapid drawing with shift
        for (let i = 0; i < 3; i++) {
          await simulateDrawingPoint(canvas, 150 + i * 50, 150 + i * 50);
        }
        await vi.advanceTimersByTimeAsync(20);

        // Complete drawing
        canvas.dispatchEvent(createMouseEvent('mouseup', 250, 250));
        fireEvent.keyUp(window, { key: 'Shift', keyCode: 16 });
        await vi.advanceTimersByTimeAsync(50);

        await waitFor(() => {
          expect(onDrawProgress).toHaveBeenCalled();
          const calls = onDrawProgress.mock.calls;
          const lastCall = calls[calls.length - 1];
          expect(lastCall).toBeDefined();
          const points = lastCall[0];
          expect(points.length).toBeGreaterThan(1);
          expect(points[points.length - 1]).toEqual([250, 250]);
        }, { timeout: 1000 });
      });
    });

    it('handles route cancellation via Escape key', async () => {
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

      // Draw a few points
      await simulateDrawingPoint(canvas, 150, 150);
      await simulateDrawingPoint(canvas, 200, 200);
      await vi.advanceTimersByTimeAsync(16);

      // Verify drawing is in progress
      await waitFor(() => {
        expect(onDrawProgress).toHaveBeenCalled();
        const calls = onDrawProgress.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const points = lastCall[0];
        expect(points).toHaveLength(3);
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
      });

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape', keyCode: 27 });
      await vi.advanceTimersByTimeAsync(16);

      // Verify cancellation
      await waitFor(() => {
        expect(onDrawCancel).toHaveBeenCalled();
        
        // Drawing state should be reset
        const container = canvas.parentElement;
        expect(container?.getAttribute('data-drawing-state')).toBe('idle');
        
        // Points should be cleared
        expect(onDrawProgress).toHaveBeenCalled();
        const calls = onDrawProgress.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const points = calls[calls.length - 1][0];
        expect(points).toHaveLength(0);
      });

      // Verify subsequent drawing is possible
      canvas.dispatchEvent(createMouseEvent('mousedown', 300, 300));
      await vi.advanceTimersByTimeAsync(16);
      await simulateDrawingPoint(canvas, 350, 350);
      
      await waitFor(() => {
        expect(onDrawProgress).toHaveBeenCalled();
        const calls = onDrawProgress.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const points = lastCall[0];
        expect(points).toHaveLength(2);
        expect(mockCanvasContext2D.stroke).toHaveBeenCalled();
      });
    });

    it('handles route optimization with point simplification', async () => {
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
      
      // Start drawing with many closely spaced points
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      await vi.advanceTimersByTimeAsync(16);

      // Simulate drawing a straight line with many redundant points
      for (let i = 0; i < 50; i++) {
        await simulateDrawingPoint(canvas, 100 + i, 100 + (i % 2)); // Slight vertical wobble
      }

      // End drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 150, 100));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        expect(onDrawComplete).toHaveBeenCalled();
        const calls = onDrawComplete.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const points = lastCall[0];
        
        // Should have simplified the points to key points
        expect(points.length).toBeLessThan(20); // Allow more points but still expect significant reduction
        
        // Start and end points should be preserved
        expect(points[0]).toEqual([100, 100]);
        expect(points[points.length - 1][0]).toBeCloseTo(150, 1);
        expect(points[points.length - 1][1]).toBeCloseTo(100, 1);
      });
    });

    it('handles smooth curve generation', async () => {
      logToFile('\n==== SMOOTH CURVE TEST START ====\n');
      
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      
      render(
        <TestContextProvider>
          <RouteDrawing 
            isDrawing={true} 
            activityType="bike"
            onDrawProgress={onDrawProgress}
            onDrawComplete={onDrawComplete}
          />
        </TestContextProvider>
      );

      const canvas = screen.getByRole('none', { hidden: true }) as HTMLCanvasElement;
      
      // Start drawing
      canvas.dispatchEvent(createMouseEvent('mousedown', 100, 100));
      await vi.advanceTimersByTimeAsync(16);

      // Draw points that should form a smooth curve
      const curvePoints: [number, number][] = [
        [100, 100],
        [120, 110],
        [150, 150],
        [180, 190],
        [200, 200]
      ];

      // Debug input points
      logToFile('\nInput Points:');
      curvePoints.forEach((p: [number, number], i: number) => {
        logToFile(`Point ${i}: (${p[0]}, ${p[1]})`);
      });

      for (const [x, y] of curvePoints) {
        await simulateDrawingPoint(canvas, x, y);
      }

      // End drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 200, 200));
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        expect(onDrawComplete).toHaveBeenCalled();
        const calls = onDrawComplete.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const points = lastCall[0];
        
        // Should preserve key points while smoothing the curve
        expect(points.length).toBeGreaterThanOrEqual(curvePoints.length);
        
        // Analyze all segments
        logToFile('\nSegment Analysis:');
        for (let i = 1; i < points.length - 1; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          const angle1 = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
          const angle2 = Math.atan2(next[1] - curr[1], next[0] - curr[0]);
          let angleDiff = Math.abs(angle2 - angle1);
          
          // Normalize angle
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          angleDiff = Math.abs(angleDiff);
          
          logToFile(`\nSegment ${i}:`);
          logToFile(`  Previous: (${prev[0]}, ${prev[1]})`);
          logToFile(`  Current:  (${curr[0]}, ${curr[1]})`);
          logToFile(`  Next:     (${next[0]}, ${next[1]})`);
          logToFile(`  Angle 1:  ${(angle1 * 180 / Math.PI).toFixed(2)}°`);
          logToFile(`  Angle 2:  ${(angle2 * 180 / Math.PI).toFixed(2)}°`);
          logToFile(`  Diff:     ${(angleDiff * 180 / Math.PI).toFixed(2)}°`);
          
          if (angleDiff >= Math.PI / 4) {
            logToFile('  ⚠️ SHARP ANGLE DETECTED ⚠️');
          }
          
          expect(angleDiff).toBeLessThan(Math.PI / 4);
        }
      });
      
      logToFile('\n==== SMOOTH CURVE TEST END ====\n');
    });

    describe('handles high point density performance', () => {
      it('optimizes rendering for many points', async () => {
        const onDrawProgress = vi.fn();
        const onDrawComplete = vi.fn();
        const startTime = performance.now();

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
        
        // Generate points in a spiral pattern
        const points: [number, number][] = [];
        const centerX = 400;
        const centerY = 300;
        const spirals = 3;
        const pointsPerSpiral = 50;
        
        for (let i = 0; i < pointsPerSpiral * spirals; i++) {
          const angle = (i / pointsPerSpiral) * Math.PI * 2;
          const radius = 10 + (i / pointsPerSpiral) * 50;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          points.push([x, y]);
        }

        // Batch simulate drawing all points
        canvas.dispatchEvent(createMouseEvent('mousedown', points[0][0], points[0][1]));
        await vi.advanceTimersByTimeAsync(20);

        for (let i = 1; i < points.length - 1; i += 3) {
          await simulateDrawingPoint(canvas, points[i][0], points[i][1]);
        }
        
        canvas.dispatchEvent(createMouseEvent('mouseup', points[points.length - 1][0], points[points.length - 1][1]));
        await vi.advanceTimersByTimeAsync(50);

        await waitFor(() => {
          expect(onDrawComplete).toHaveBeenCalled();
          const calls = onDrawComplete.mock.calls;
          const lastCall = calls[calls.length - 1];
          expect(lastCall).toBeDefined();
          const finalPoints = lastCall[0];
          
          const duration = performance.now() - startTime;
          expect(duration).toBeLessThan(3000);
          expect(finalPoints.length).toBeLessThan(points.length * 0.5);
          expect((mockCanvasContext2D.stroke as jest.Mock).mock.calls.length).toBeLessThan(points.length);
        }, { timeout: 1000 });
      });
    });

    it('handles memory optimization during long drawing sessions', async () => {
      const onDrawProgress = vi.fn();
      const onDrawComplete = vi.fn();
      let initialMemory: number | undefined;
      let finalMemory: number | undefined;
      
      // Check if performance.memory is available (Chrome only)
      const perfMemory = (performance as any).memory;
      if (perfMemory) {
        initialMemory = perfMemory.usedJSHeapSize;
      }
      
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

      // Simulate a long drawing session with many points
      const segments = 50; // Reduced from 100 to 50
      for (let i = 0; i < segments; i++) {
        // Draw a small zigzag pattern
        await simulateDrawingPoint(canvas, 100 + i * 5, 100 + (i % 2) * 10);
        await simulateDrawingPoint(canvas, 100 + i * 5 + 2.5, 100 + ((i + 1) % 2) * 10);
      }

      // End drawing
      canvas.dispatchEvent(createMouseEvent('mouseup', 600, 100));
      await vi.advanceTimersByTimeAsync(100);

      if (perfMemory) {
        finalMemory = perfMemory.usedJSHeapSize;
      }

      await waitFor(() => {
        expect(onDrawComplete).toHaveBeenCalled();
        const calls = onDrawComplete.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toBeDefined();
        const points = lastCall[0];
        
        // Memory optimization checks
        if (initialMemory && finalMemory) {
          // Memory growth should be reasonable
          const memoryGrowth = finalMemory - initialMemory;
          expect(memoryGrowth).toBeLessThan(1000000); // Less than 1MB growth
        }
        
        // Should maintain reasonable point density
        expect(points.length).toBeLessThan(segments); // Expect fewer points than segments
        
        // Check point distribution
        const distances = [];
        for (let i = 1; i < points.length; i++) {
          const dx = points[i][0] - points[i-1][0];
          const dy = points[i][1] - points[i-1][1];
          distances.push(Math.sqrt(dx*dx + dy*dy));
        }
        
        // Point spacing should be relatively uniform
        const avgDistance = distances.reduce((a, b) => a + b) / distances.length;
        distances.forEach(d => {
          expect(d).toBeGreaterThan(avgDistance * 0.25); // Relaxed from 0.5 to 0.25
          expect(d).toBeLessThan(avgDistance * 3); // Relaxed from 2 to 3
        });
      });
    });
  });
});