import React, { useEffect, useRef } from 'react';
import { vi, Mock } from 'vitest';

interface TestContextProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

// Create mock functions with proper vitest mock setup
const createMockFunction = (implementation?: (...args: any[]) => any): Mock => {
  return vi.fn(implementation);
};

// Create a mock canvas context that implements CanvasRenderingContext2D
const createMockContext = () => {
  const mockContext = {
    clearRect: createMockFunction(),
    beginPath: createMockFunction(),
    moveTo: createMockFunction(),
    lineTo: createMockFunction(),
    stroke: createMockFunction(),
    fill: createMockFunction(),
    closePath: createMockFunction(),
    arc: createMockFunction(),
    rect: createMockFunction(),
    fillRect: createMockFunction(),
    strokeRect: createMockFunction(),
    getContextAttributes: createMockFunction(() => ({
      alpha: true,
      desynchronized: false,
      colorSpace: 'srgb',
      willReadFrequently: false
    })),
    save: createMockFunction(),
    restore: createMockFunction(),
    scale: createMockFunction(),
    rotate: createMockFunction(),
    translate: createMockFunction(),
    transform: createMockFunction(),
    setTransform: createMockFunction(),
    resetTransform: createMockFunction(),
    createLinearGradient: createMockFunction(),
    createRadialGradient: createMockFunction(),
    createPattern: createMockFunction(),
    drawImage: createMockFunction(),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    clip: createMockFunction(),
    isPointInPath: createMockFunction(),
    isPointInStroke: createMockFunction(),
    measureText: createMockFunction(() => ({ width: 0 })),
    fillText: createMockFunction(),
    strokeText: createMockFunction(),
    setLineDash: createMockFunction(),
    getLineDash: createMockFunction(() => []),
    createImageData: createMockFunction(),
    getImageData: createMockFunction(),
    putImageData: createMockFunction(),
    quadraticCurveTo: createMockFunction(),
    bezierCurveTo: createMockFunction(),
    arcTo: createMockFunction(),
    ellipse: createMockFunction(),
    roundRect: createMockFunction(),
    direction: 'ltr' as CanvasDirection,
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as ImageSmoothingQuality,
    filter: 'none',
    lineDashOffset: 0
  } as unknown as CanvasRenderingContext2D;

  return mockContext;
};

// Export mock canvas context for tests
export const mockCanvasContext2D = createMockContext();

// Export mockRAF for test usage
export const mockRAF = vi.fn((callback: FrameRequestCallback) => setTimeout(callback, 16));

export const TestContextProvider: React.FC<TestContextProviderProps> = ({ children, isAuthenticated = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.querySelector('canvas');
      if (canvas) {
        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 600;

        // Attach canvas to context
        Object.defineProperty(mockCanvasContext2D, 'canvas', {
          value: canvas,
          writable: false,
          configurable: true
        });

        // Create a properly typed getContext mock
        const getContextMock = vi.fn((contextId: string, options?: any) => {
          if (contextId === '2d') {
            return mockCanvasContext2D;
          }
          return null;
        }) as {
          (contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
          (contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null;
          (contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
          (contextId: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;
        };

        // Override getContext to return our mock
        Object.defineProperty(canvas, 'getContext', {
          value: getContextMock,
          writable: true,
          configurable: true
        });

        // Mock getBoundingClientRect
        canvas.getBoundingClientRect = vi.fn(() => ({
          x: 0,
          y: 0,
          width: 800,
          height: 600,
          top: 0,
          right: 800,
          bottom: 600,
          left: 0,
          toJSON: () => ({})
        }));

        // Reset all mock functions
        Object.values(mockCanvasContext2D)
          .filter((value): value is Mock => typeof value === 'function' && 'mockReset' in value)
          .forEach(mockFn => mockFn.mockReset());

        // Set initial drawing state
        const routeDrawingDiv = canvas.parentElement;
        if (routeDrawingDiv) {
          routeDrawingDiv.setAttribute('data-drawing-state', 'drawing');
        }

        // Mock requestAnimationFrame
        const originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = mockRAF;
        window.cancelAnimationFrame = vi.fn();

        return () => {
          window.requestAnimationFrame = originalRAF;
        };
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="test-context"
      style={{ width: 800, height: 600 }}
    >
      {children}
    </div>
  );
}; 