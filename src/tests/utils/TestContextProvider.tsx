import React from 'react';
import { vi, Mock } from 'vitest';

interface MockCanvasState {
  _currentPath: [number, number][];
  _lastPoint: [number, number] | null;
  _isDrawing: boolean;
  _strokeCalls: number;
}

// Create mock RAF
export const mockRAF = vi.fn((callback: FrameRequestCallback): number => {
  setTimeout(() => callback(performance.now()), 16);
  return 1;
});

// Create a type for our extended mock context
interface MockCanvasContext extends Partial<CanvasRenderingContext2D> {
  getState: () => MockCanvasState;
  resetState: () => void;
  _currentPath: [number, number][];
  _lastPoint: [number, number] | null;
  _isDrawing: boolean;
  _strokeCalls: number;
  canvas: HTMLCanvasElement | undefined;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  stroke: () => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
}

// Create a mock canvas context that implements CanvasRenderingContext2D
const createMockCanvasContext = (): MockCanvasContext => {
  const state: MockCanvasState = {
    _currentPath: [],
    _lastPoint: null,
    _isDrawing: false,
    _strokeCalls: 0,
  };

  const mockContext: MockCanvasContext = {
    ...state,
    
    // Drawing state
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
    canvas: undefined,

    // Core drawing methods
    beginPath: vi.fn(() => {
      console.log('Mock beginPath called');
      mockContext._currentPath = [];
      mockContext._isDrawing = true;
    }),

    moveTo: vi.fn((x: number, y: number) => {
      console.log('Mock moveTo called:', x, y);
      mockContext._lastPoint = [x, y];
      mockContext._currentPath = [[x, y]];
    }),

    lineTo: vi.fn((x: number, y: number) => {
      console.log('Mock lineTo called:', x, y);
      if (mockContext._isDrawing) {
        mockContext._lastPoint = [x, y];
        mockContext._currentPath.push([x, y]);
      }
    }),

    stroke: vi.fn(() => {
      console.log('Mock stroke called');
      if (mockContext._isDrawing) {
        mockContext._strokeCalls++;
      }
    }),

    clearRect: vi.fn((x: number, y: number, width: number, height: number) => {
      console.log('Mock clearRect called:', x, y, width, height);
      mockContext._currentPath = [];
      mockContext._lastPoint = null;
      mockContext._isDrawing = false;
    }),

    // State management
    getState: () => ({
      _currentPath: mockContext._currentPath,
      _lastPoint: mockContext._lastPoint,
      _isDrawing: mockContext._isDrawing,
      _strokeCalls: mockContext._strokeCalls
    }),

    resetState: () => {
      mockContext._currentPath = [];
      mockContext._lastPoint = null;
      mockContext._isDrawing = false;
      mockContext._strokeCalls = 0;
      console.log('Mock context state after reset:', mockContext.getState());
    },

    // Required CanvasRenderingContext2D methods
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    getTransform: vi.fn(),
    resetTransform: vi.fn(),
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createPattern: vi.fn(),
    clip: vi.fn(),
    fill: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    measureText: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    drawImage: vi.fn(),
    createImageData: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    getContextAttributes: vi.fn((): CanvasRenderingContext2DSettings => ({
      alpha: true,
      colorSpace: 'srgb' as PredefinedColorSpace,
      desynchronized: false,
      willReadFrequently: false
    })),
  };

  return mockContext;
};

// Create mock canvas context instance
export const mockCanvasContext2D = createMockCanvasContext();

// Mock canvas element setup
const mockCanvasSetup = (canvas: HTMLCanvasElement) => {
  const getContextMock = vi.fn((contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2', options?: any) => {
    if (contextId === '2d') {
      return mockCanvasContext2D as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as unknown as HTMLCanvasElement['getContext'];

  canvas.getContext = getContextMock;

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
};

interface TestContextProviderProps {
  children: React.ReactNode;
}

export const TestContextProvider: React.FC<TestContextProviderProps> = ({ children }) => {
  React.useEffect(() => {
    // Mock requestAnimationFrame
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = mockRAF;
    window.cancelAnimationFrame = vi.fn();

    return () => {
      window.requestAnimationFrame = originalRAF;
    };
  }, []);

  return (
    <div
      data-testid="test-context"
      style={{ width: 800, height: 600, position: 'relative' }}
    >
      {children}
    </div>
  );
};

// Extend HTMLCanvasElement prototype for testing
if (typeof window !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(
    this: HTMLCanvasElement,
    contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2',
    options?: any
  ) {
    if (contextId === '2d') {
      return mockCanvasContext2D as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext.call(this, contextId, options);
  } as HTMLCanvasElement['getContext'];
} 