import { vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteCreator } from '@/components/route/RouteCreator';
import { routeService } from '@/services/routeService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { MultiSegmentRouteOptimizer } from '@/services/route/MultiSegmentRouteOptimizer';
import { ActivityType } from '@/types/route/types';

// Mock the services
vi.mock('@/services/routeService', () => ({
  routeService: {
    saveRoute: vi.fn().mockResolvedValue({ success: true }),
    getCurrentLocation: vi.fn().mockResolvedValue([0, 0])
  }
}));

vi.mock('@/services/weather/WeatherService');
vi.mock('@/services/terrain/TerrainAnalysisService');
vi.mock('@/services/traffic/TrafficService');
vi.mock('@/services/route/MultiSegmentRouteOptimizer');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Critical - Route Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProps = {
    activityType: 'WALK' as ActivityType,
    onRouteCreate: vi.fn(),
    onCancel: vi.fn()
  };

  it('basic map functionality', async () => {
    await act(async () => {
      render(<RouteCreator {...mockProps} />);
    });

    await waitFor(() => {
      expect(routeService.getCurrentLocation).toHaveBeenCalled();
    });
  });

  it('route creation and saving', async () => {
    await act(async () => {
      render(<RouteCreator {...mockProps} />);
    });
    
    // Fill in route name
    const routeNameInput = screen.getByLabelText('Route Name');
    await userEvent.type(routeNameInput, 'Test Route');
    
    // Add a segment
    const addSegmentButton = screen.getByText('Add Segment');
    await userEvent.click(addSegmentButton);
    
    // Simulate drawing points
    const mockPoints: [number, number][] = [
      [0, 0],
      [1, 1]
    ];
    
    // Mock the segment completion
    await act(async () => {
      const routeDrawing = screen.getByTestId('route-drawing');
      routeDrawing.dispatchEvent(new CustomEvent('segmentComplete', {
        detail: { points: mockPoints }
      }));
    });

    // Click save
    const saveButton = screen.getByText('Save Route');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(routeService.saveRoute).toHaveBeenCalled();
      expect(screen.getByText('Route saved successfully')).toBeInTheDocument();
    });

    expect(mockProps.onRouteCreate).toHaveBeenCalled();
  });

  it('handles validation errors', async () => {
    await act(async () => {
      render(<RouteCreator {...mockProps} />);
    });

    // Try to save without a route name
    const saveButton = screen.getByText('Save Route');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Route name is required')).toBeInTheDocument();
    });
  });

  it('handles optimization errors', async () => {
    // Mock optimization failure
    vi.mocked(MultiSegmentRouteOptimizer.prototype.optimizeMultiSegmentRoute)
      .mockRejectedValueOnce(new Error('Optimization failed'));

    await act(async () => {
      render(<RouteCreator {...mockProps} />);
    });

    // Fill in route name
    await userEvent.type(screen.getByLabelText('Route Name'), 'Test Route');
    
    // Add a segment
    await userEvent.click(screen.getByText('Add Segment'));
    
    // Mock segment completion
    await act(async () => {
      const routeDrawing = screen.getByTestId('route-drawing');
      routeDrawing.dispatchEvent(new CustomEvent('segmentComplete', {
        detail: { points: [[0, 0], [1, 1]] }
      }));
    });

    // Try to save
    await userEvent.click(screen.getByText('Save Route'));

    await waitFor(() => {
      expect(screen.getByText('Failed to optimize route. Please try again.')).toBeInTheDocument();
    });
  });
}); 