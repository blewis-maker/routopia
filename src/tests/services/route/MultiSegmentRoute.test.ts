import {
  MockWeatherService,
  MockPOIService,
  MockMCPService,
  MockRealTimeOptimizer,
  createMockRouteResult
} from '../../mocks/services/route/MockRouteServices';
import { RouteService } from '@/services/route/RouteService';
import { 
  RouteSegment, 
  RouteType, 
  OptimizationPreference,
  RouteMetrics,
  TerrainConditions,
  OptimizationResult
} from '@/types/route/types';
import { WeatherConditions } from '@/types/weather';
import { GeoPoint } from '@/types/geo';

describe('Multi-Segment Route System', () => {
  let routeService: RouteService;
  let mockOptimizer: MockRealTimeOptimizer;
  let mockWeatherService: MockWeatherService;
  let mockPOIService: MockPOIService;
  let mockMCPService: MockMCPService;

  const mockStartPoint: GeoPoint = { lat: 40.7128, lng: -74.0060 }; // NYC
  const mockEndPoint: GeoPoint = { lat: 40.7614, lng: -73.9776 }; // Central Park
  const mockWaypoint: GeoPoint = { lat: 40.7505, lng: -73.9934 }; // Empire State

  beforeEach(() => {
    mockWeatherService = new MockWeatherService();
    mockPOIService = new MockPOIService();
    mockMCPService = new MockMCPService();
    mockOptimizer = new MockRealTimeOptimizer(mockWeatherService, mockMCPService);
    routeService = new RouteService(mockOptimizer, mockPOIService, mockMCPService);
  });

  describe('Route Segment Creation', () => {
    it('should create valid multi-segment routes with different activity types', async () => {
      const mockResult = createMockRouteResult(2);
      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, mockWaypoint],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0.1,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const segments: RouteSegment[] = [
        {
          start: mockStartPoint,
          end: mockWaypoint,
          type: 'WALK' as RouteType,
          preferences: {
            optimize: 'TIME' as OptimizationPreference,
            avoidHills: true,
            preferScenic: true
          }
        },
        {
          start: mockWaypoint,
          end: mockEndPoint,
          type: 'BIKE' as RouteType,
          preferences: {
            optimize: 'DISTANCE' as OptimizationPreference,
            preferBikeLanes: true
          }
        }
      ];

      const route = await routeService.createMultiSegmentRoute(segments);
      
      expect(route).toBeDefined();
      expect(route.segments).toHaveLength(2);
      expect(route.segments[0].type).toBe('WALK');
      expect(route.segments[1].type).toBe('BIKE');
      expect(route.totalDistance).toBeGreaterThan(0);
      expect(route.estimatedDuration).toBeGreaterThan(0);
    });

    it('should handle complex routes with multiple waypoints', async () => {
      const intermediatePoints = [
        { lat: 40.7505, lng: -73.9934 }, // Empire State
        { lat: 40.7527, lng: -73.9772 }, // Grand Central
        { lat: 40.7587, lng: -73.9787 }, // Rockefeller Center
      ];

      const mockResult = createMockRouteResult(intermediatePoints.length);
      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, intermediatePoints[0]],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0.1,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const segments = intermediatePoints.map((point, index) => ({
        start: index === 0 ? mockStartPoint : intermediatePoints[index - 1],
        end: point,
        type: 'WALK' as RouteType,
        preferences: {
          optimize: 'TIME' as OptimizationPreference,
          preferScenic: true
        }
      }));

      const route = await routeService.createMultiSegmentRoute(segments);
      
      expect(route.segments).toHaveLength(intermediatePoints.length);
      expect(route.segments.every(s => s.path.length > 0)).toBe(true);
    });
  });

  describe('Route Optimization', () => {
    it('should optimize segments based on real-time conditions', async () => {
      const mockWeather: WeatherConditions = {
        temperature: 25,
        conditions: 'rain',
        windSpeed: 15,
        precipitation: 5,
        humidity: 80,
        visibility: 5000,
        pressure: 1013,
        uvIndex: 2,
        cloudCover: 90
      };

      const mockTerrain: TerrainConditions = {
        elevation: 50,
        surface: 'paved',
        difficulty: 'moderate',
        features: ['urban', 'hills']
      };

      mockWeatherService.setMockWeather(mockWeather);
      mockMCPService.setMockTerrain(mockTerrain);

      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, mockWaypoint],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.8,
          weatherImpact: 0.4,
          terrainDifficulty: 0.5
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const segments: RouteSegment[] = [
        {
          start: mockStartPoint,
          end: mockWaypoint,
          type: 'WALK' as RouteType,
          preferences: { optimize: 'SAFETY' as OptimizationPreference }
        }
      ];

      const route = await routeService.createMultiSegmentRoute(segments);
      const metrics = route.segments[0].metrics as RouteMetrics;

      expect(metrics.safety).toBeGreaterThan(0.7);
      expect(metrics.weatherImpact).toBeDefined();
      expect(metrics.terrainDifficulty).toBeDefined();
    });

    it('should handle concurrent optimization requests', async () => {
      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, mockEndPoint],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0.1,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const requests = Array(5).fill(null).map(() => ({
        segments: [{
          start: mockStartPoint,
          end: mockEndPoint,
          type: 'WALK' as RouteType,
          preferences: { optimize: 'TIME' as OptimizationPreference }
        }]
      }));

      const results = await Promise.all(
        requests.map(req => routeService.createMultiSegmentRoute(req.segments))
      );

      expect(results).toHaveLength(5);
      results.forEach(route => {
        expect(route.segments).toBeDefined();
        expect(route.totalDistance).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid segment combinations gracefully', async () => {
      const invalidSegments: RouteSegment[] = [
        {
          start: mockStartPoint,
          end: { lat: 90.1, lng: -74.0060 }, // Invalid latitude
          type: 'WALK' as RouteType,
          preferences: { optimize: 'TIME' as OptimizationPreference }
        }
      ];

      await expect(
        routeService.createMultiSegmentRoute(invalidSegments)
      ).rejects.toThrow('Invalid coordinates');
    });

    it('should handle service failures gracefully', async () => {
      mockWeatherService.getWeatherForLocation = jest.fn().mockRejectedValue(
        new Error('Weather service unavailable')
      );

      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, mockEndPoint],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: null,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'WALK' as RouteType,
        preferences: { optimize: 'TIME' as OptimizationPreference }
      }];

      const route = await routeService.createMultiSegmentRoute(segments);
      
      expect(route).toBeDefined();
      expect(route.segments[0].metrics.weatherImpact).toBeNull();
      expect(route.segments[0].path).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should optimize routes within acceptable time limits', async () => {
      const mockOptResult: OptimizationResult = {
        path: [mockStartPoint, mockEndPoint],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0.1,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const startTime = Date.now();
      
      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'WALK' as RouteType,
        preferences: { optimize: 'TIME' as OptimizationPreference }
      }];

      await routeService.createMultiSegmentRoute(segments);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should be much faster with mocks
    });

    it('should handle large multi-segment routes efficiently', async () => {
      const points = Array(10).fill(null).map((_, i) => ({
        lat: mockStartPoint.lat + (i * 0.01),
        lng: mockStartPoint.lng + (i * 0.01)
      }));

      const mockOptResult: OptimizationResult = {
        path: [points[0], points[1]],
        metrics: {
          distance: 1000,
          duration: 600,
          elevation: {
            gain: 10,
            loss: 5,
            profile: []
          },
          safety: 0.9,
          weatherImpact: 0.1,
          terrainDifficulty: 0.3
        }
      };

      mockOptimizer.setMockOptimizationResult(mockOptResult);

      const segments = points.slice(1).map((point, index) => ({
        start: points[index],
        end: point,
        type: 'WALK' as RouteType,
        preferences: { optimize: 'TIME' as OptimizationPreference }
      }));

      const startTime = Date.now();
      const route = await routeService.createMultiSegmentRoute(segments);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500); // Should be much faster with mocks
      expect(route.segments).toHaveLength(points.length - 1);
    });
  });
}); 