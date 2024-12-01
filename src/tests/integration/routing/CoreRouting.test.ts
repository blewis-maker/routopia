import { 
  RouteEngine, 
  PathFinder, 
  ActivityOptimizer, 
  RouteAdapter 
} from '@/services/routing';

describe('Core Routing Integration', () => {
  describe('End-to-End Route Generation', () => {
    it('should generate a complete route with all required components', async () => {
      const routeRequest = {
        start: { lat: 40.7128, lng: -74.0060 },
        end: { lat: 40.7589, lng: -73.9851 },
        activity: 'hiking' as ActivityType,
        preferences: {
          difficulty: 'moderate',
          maxDistance: 10000,
          elevationGain: 'moderate'
        }
      };

      const result = await RouteEngine.getInstance().generateRoute(routeRequest);

      expect(result.success).toBe(true);
      expect(result.data).toMatchSnapshot({
        path: expect.any(Array),
        metrics: expect.objectContaining({
          totalDistance: expect.any(Number),
          totalDuration: expect.any(Number)
        }),
        segments: expect.any(Array)
      });
    });

    it('should handle real-time adaptations correctly', async () => {
      const mockWeatherChange = {
        type: 'weather',
        severity: 'moderate',
        location: { lat: 40.7128, lng: -74.0060 }
      };

      const adapter = RouteAdapter.getInstance();
      const adaptedRoute = await adapter.adaptRoute({
        currentRoute: mockRoute,
        conditions: mockWeatherChange,
        userLocation: mockUserLocation,
        activity: 'hiking'
      });

      expect(adaptedRoute).toMatchSnapshot({
        adaptedPath: expect.any(Array),
        safetyInfo: expect.any(Object)
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should recover from service interruptions', async () => {
      // Test service recovery
    });

    it('should provide fallback routes when optimal path is unavailable', async () => {
      // Test fallback scenarios
    });
  });
}); 