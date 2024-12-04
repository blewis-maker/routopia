// src/tests/utils/TestUtils.ts
import { render, RenderOptions } from '@testing-library/react';
import { TestContextProvider } from './TestContextProvider';

// Enhanced render utility with context
interface CustomRenderOptions extends RenderOptions {
  initialRoute?: Route;
  mockWeather?: WeatherData;
  mockTraffic?: TrafficData;
  mockUser?: UserData;
}

export const renderWithContext = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialRoute,
    mockWeather,
    mockTraffic,
    mockUser,
    ...renderOptions
  } = options;

  return render(
    <TestContextProvider
      initialRoute={initialRoute}
      mockWeather={mockWeather}
      mockTraffic={mockTraffic}
      mockUser={mockUser}
    >
      {ui}
    </TestContextProvider>,
    renderOptions
  );
};

// Canvas interaction utilities
export const simulateCanvasEvent = async (
  canvas: HTMLCanvasElement,
  eventType: 'mousedown' | 'mousemove' | 'mouseup',
  coordinates: { x: number; y: number }
) => {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    clientX: coordinates.x,
    clientY: coordinates.y
  });
  
  await act(async () => {
    canvas.dispatchEvent(event);
  });
};

// Async utilities
export const waitForRouteRender = async () => {
  await waitFor(
    () => {
      const canvas = screen.getByTestId('route-canvas');
      const context = canvas.getContext('2d');
      return context?.getImageData(0, 0, canvas.width, canvas.height).data
        .some(pixel => pixel !== 0);
    },
    { timeout: 2000 }
  );
};

// Mock data generators
export const createMockRoute = (overrides?: Partial<Route>): Route => ({
  id: 'test-route-1',
  points: [
    { lat: 40.7128, lng: -74.0060 },
    { lat: 40.7614, lng: -73.9776 }
  ],
  type: 'CAR',
  status: 'ACTIVE',
  ...overrides
});

// src/tests/__mocks__/ServiceMocks.ts
export class MockRouteService implements RouteService {
  private routes: Map<string, Route> = new Map();

  async createRoute(route: Route): Promise<Route> {
    const id = route.id || `route-${Date.now()}`;
    const newRoute = { ...route, id };
    this.routes.set(id, newRoute);
    return newRoute;
  }

  async getRoute(id: string): Promise<Route> {
    const route = this.routes.get(id);
    if (!route) throw new Error(`Route ${id} not found`);
    return route;
  }
}

// Example updated test file using new utilities
// src/tests/components/RouteVisualization.test.tsx
import { renderWithContext, simulateCanvasEvent, waitForRouteRender, createMockRoute } from '../utils/TestUtils';
import { MockRouteService } from '../__mocks__/ServiceMocks';

describe('RouteVisualization', () => {
  const mockRoute = createMockRoute();
  const mockRouteService = new MockRouteService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders route on canvas correctly', async () => {
    const { getByTestId } = renderWithContext(<RouteVisualization />, {
      initialRoute: mockRoute,
    });

    const canvas = getByTestId('route-canvas');
    await waitForRouteRender();

    expect(canvas).toBeInTheDocument();
  });

  it('handles route modifications', async () => {
    const { getByTestId } = renderWithContext(<RouteVisualization />, {
      initialRoute: mockRoute,
    });

    const canvas = getByTestId('route-canvas');
    
    // Simulate dragging a route point
    await simulateCanvasEvent(canvas, 'mousedown', { x: 100, y: 100 });
    await simulateCanvasEvent(canvas, 'mousemove', { x: 150, y: 150 });
    await simulateCanvasEvent(canvas, 'mouseup', { x: 150, y: 150 });

    await waitForRouteRender();
    
    // Verify route was updated
    const updatedRoute = await mockRouteService.getRoute(mockRoute.id);
    expect(updatedRoute.points[0]).not.toEqual(mockRoute.points[0]);
  });

  it('updates route preview on traffic changes', async () => {
    const mockTraffic = {
      severity: 'HEAVY',
      delay: 15
    };

    const { rerender } = renderWithContext(<RouteVisualization />, {
      initialRoute: mockRoute,
      mockTraffic
    });

    await waitForRouteRender();

    // Simulate traffic update
    rerender(<RouteVisualization />, {
      initialRoute: mockRoute,
      mockTraffic: { ...mockTraffic, severity: 'MODERATE' }
    });

    await waitForRouteRender();
    // Add assertions for updated visualization
  });
});
