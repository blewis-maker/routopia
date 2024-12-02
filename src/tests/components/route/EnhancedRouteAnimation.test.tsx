import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { EnhancedRouteAnimation } from '@/components/route/EnhancedRouteAnimation';
import type { ActivityType } from '@/types/routes';

// Mock mapboxgl
const mockMap = {
  getCanvas: () => ({ width: 800, height: 600 }),
  project: ({ lng, lat }: { lng: number; lat: number }) => ({ x: lng * 100, y: lat * 100 }),
  unproject: (point: [number, number]) => ({ lng: point[0] / 100, lat: point[1] / 100 })
};

jest.mock('@react-spring/web', () => ({
  useSpring: () => [{
    progress: 0
  }, {
    start: jest.fn(),
    pause: jest.fn()
  }],
  animated: {
    div: 'div'
  },
  config: {
    gentle: {}
  }
}));

describe('EnhancedRouteAnimation', () => {
  const defaultProps = {
    path: [[0, 0], [1, 1], [2, 2]] as [number, number][],
    activityType: 'bike' as ActivityType,
    isAnimating: true,
    duration: 2000,
    mapInstance: mockMap as unknown as mapboxgl.Map
  };

  beforeEach(() => {
    // Mock canvas context
    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      setLineDash: jest.fn(),
      canvas: { width: 800, height: 600 }
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
  });

  it('renders canvas element', () => {
    render(<EnhancedRouteAnimation {...defaultProps} />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName.toLowerCase()).toBe('canvas');
  });

  it('handles animation state changes', () => {
    const { rerender } = render(<EnhancedRouteAnimation {...defaultProps} />);
    
    // Test animation stop
    rerender(<EnhancedRouteAnimation {...defaultProps} isAnimating={false} />);
    
    // Test animation restart
    rerender(<EnhancedRouteAnimation {...defaultProps} isAnimating={true} />);
  });

  it('applies correct activity styles', () => {
    const activities: ActivityType[] = ['car', 'bike', 'walk', 'ski'];
    
    activities.forEach(activity => {
      const { container } = render(
        <EnhancedRouteAnimation 
          {...defaultProps}
          activityType={activity}
        />
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toHaveClass('route-animation-overlay');
    });
  });

  it('handles empty path gracefully', () => {
    render(
      <EnhancedRouteAnimation 
        {...defaultProps}
        path={[]}
      />
    );
    
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
  });

  it('handles missing map instance', () => {
    render(
      <EnhancedRouteAnimation 
        {...defaultProps}
        mapInstance={undefined}
      />
    );
    
    const canvas = screen.getByRole('img');
    expect(canvas).toHaveAttribute('width', '0');
    expect(canvas).toHaveAttribute('height', '0');
  });
}); 