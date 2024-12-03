import React from 'react';
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
export const mockCanvasContext = {
  canvas: document.createElement('canvas'),
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
  createImageData: createMockFunction(),
  getImageData: createMockFunction(),
  putImageData: createMockFunction(),
  isPointInPath: createMockFunction(),
  isPointInStroke: createMockFunction(),
  measureText: createMockFunction(() => ({ width: 0 })),
  fillText: createMockFunction(),
  strokeText: createMockFunction(),
  setLineDash: createMockFunction(),
  getLineDash: createMockFunction(() => []),
  clip: createMockFunction(),
  quadraticCurveTo: createMockFunction(),
  bezierCurveTo: createMockFunction(),
  createConicGradient: createMockFunction(),
  arcTo: createMockFunction(),
  ellipse: createMockFunction(),
  roundRect: createMockFunction(),
  
  // Properties with getters/setters to track changes
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  miterLimit: 10,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
  lineDashOffset: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  font: '10px sans-serif',
  textAlign: 'start' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
  direction: 'ltr' as CanvasDirection,
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low' as ImageSmoothingQuality,
  filter: 'none',
} as CanvasRenderingContext2D;

export const TestContextProvider: React.FC<TestContextProviderProps> = ({ 
  children, 
  isAuthenticated = false 
}) => {
  React.useEffect(() => {
    // Store original getContext
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    // Mock getContext
    const mockGetContext = createMockFunction((contextId: string) => {
      if (contextId === '2d') {
        return mockCanvasContext;
      }
      return null;
    });

    // Apply mock
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(mockGetContext);

    // Mock getBoundingClientRect for canvas elements
    const mockGetBoundingClientRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function(this: HTMLElement) {
        if (this instanceof HTMLCanvasElement) {
          return {
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            top: 0,
            right: 800,
            bottom: 600,
            left: 0,
            toJSON: () => ({})
          };
        }
        return new DOMRect();
      });

    // Clean up
    return () => {
      spy.mockRestore();
      mockGetBoundingClientRect.mockRestore();
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);

  return (
    <div data-testid="test-context" style={{ width: '800px', height: '600px' }}>
      {children}
    </div>
  );
}; 