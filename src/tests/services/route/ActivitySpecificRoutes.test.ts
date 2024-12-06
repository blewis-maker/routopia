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
  TerrainConditions
} from '@/types/route/types';
import { WeatherConditions } from '@/types/weather';
import { GeoPoint } from '@/types/geo';

describe('Activity-Specific Route Features', () => {
  let routeService: RouteService;
  let mockOptimizer: MockRealTimeOptimizer;
  let mockWeatherService: MockWeatherService;
  let mockPOIService: MockPOIService;
  let mockMCPService: MockMCPService;

  const mockStartPoint: GeoPoint = { lat: 40.7128, lng: -74.0060 }; // NYC
  const mockEndPoint: GeoPoint = { lat: 40.7614, lng: -73.9776 }; // Central Park

  beforeEach(() => {
    mockWeatherService = new MockWeatherService();
    mockPOIService = new MockPOIService();
    mockMCPService = new MockMCPService();
    mockOptimizer = new MockRealTimeOptimizer(mockWeatherService, mockMCPService);
    routeService = new RouteService(mockOptimizer, mockPOIService, mockMCPService);
  });

  describe('Ski Routes', () => {
    it('should optimize routes based on snow conditions', async () => {
      const mockWeather: WeatherConditions = {
        temperature: -5,
        conditions: 'snow',
        windSpeed: 10,
        precipitation: 2,
        humidity: 85,
        visibility: 8000,
        pressure: 1013,
        uvIndex: 3,
        cloudCover: 70
      };

      const mockTerrain: TerrainConditions = {
        elevation: 1500,
        surface: 'snow',
        difficulty: 'intermediate',
        features: ['slopes', 'groomed']
      };

      mockWeatherService.setMockWeather(mockWeather);
      mockMCPService.setMockTerrain(mockTerrain);

      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'SKI' as RouteType,
        preferences: {
          optimize: 'SNOW_CONDITIONS' as OptimizationPreference,
          preferGroomed: true,
          difficultyLevel: 'intermediate'
        }
      }];

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.snowQuality).toBeGreaterThan(0.7);
      expect(route.segments[0].metrics.terrainDifficulty).toBe('intermediate');
    });

    it('should handle mixed snow conditions', async () => {
      const segments = [
        {
          start: mockStartPoint,
          end: { lat: 40.73, lng: -73.99 },
          type: 'SKI' as RouteType,
          preferences: { optimize: 'SNOW_CONDITIONS' as OptimizationPreference }
        },
        {
          start: { lat: 40.73, lng: -73.99 },
          end: mockEndPoint,
          type: 'SKI' as RouteType,
          preferences: { optimize: 'SNOW_CONDITIONS' as OptimizationPreference }
        }
      ];

      mockMCPService.getTerrainConditions = jest.fn()
        .mockImplementation((location: GeoPoint) => {
          return Promise.resolve({
            elevation: location.lat > 40.73 ? 1800 : 1200,
            surface: 'snow',
            difficulty: location.lat > 40.73 ? 'expert' : 'intermediate',
            features: ['slopes', location.lat > 40.73 ? 'ungroomed' : 'groomed']
          });
        });

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.terrainDifficulty).toBe('intermediate');
      expect(route.segments[1].metrics.terrainDifficulty).toBe('expert');
    });
  });

  describe('Run Routes', () => {
    it('should optimize for runner preferences', async () => {
      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'RUN' as RouteType,
        preferences: {
          optimize: 'PERFORMANCE' as OptimizationPreference,
          preferSoftSurface: true,
          avoidTraffic: true,
          targetPace: 5 // 5 min/km
        }
      }];

      const mockTerrain: TerrainConditions = {
        elevation: 50,
        surface: 'trail',
        difficulty: 'moderate',
        features: ['park', 'trail']
      };

      mockMCPService.setMockTerrain(mockTerrain);

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.surfaceType).toBe('trail');
      expect(route.segments[0].metrics.trafficLevel).toBeLessThan(0.3);
    });

    it('should handle interval training routes', async () => {
      const segments = Array(4).fill(null).map((_, index) => ({
        start: {
          lat: mockStartPoint.lat + (index * 0.01),
          lng: mockStartPoint.lng + (index * 0.01)
        },
        end: {
          lat: mockStartPoint.lat + ((index + 1) * 0.01),
          lng: mockStartPoint.lng + ((index + 1) * 0.01)
        },
        type: 'RUN' as RouteType,
        preferences: {
          optimize: index % 2 === 0 ? 'SPEED' : 'RECOVERY' as OptimizationPreference,
          targetPace: index % 2 === 0 ? 4 : 6 // Alternating fast/slow segments
        }
      }));

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments).toHaveLength(4);
      expect(route.segments[0].metrics.recommendedPace).toBeLessThan(
        route.segments[1].metrics.recommendedPace
      );
    });
  });

  describe('Bike Routes', () => {
    it('should optimize for cycling infrastructure', async () => {
      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'BIKE' as RouteType,
        preferences: {
          optimize: 'SAFETY' as OptimizationPreference,
          preferBikeLanes: true,
          avoidTraffic: true
        }
      }];

      mockPOIService.getNearbyPOIs = jest.fn().mockResolvedValue([
        { type: 'bike_lane', location: { lat: 40.72, lng: -73.98 } },
        { type: 'bike_parking', location: { lat: 40.73, lng: -73.99 } }
      ]);

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.bikeLaneCoverage).toBeGreaterThan(0.8);
      expect(route.segments[0].metrics.trafficLevel).toBeLessThan(0.3);
    });

    it('should handle different cycling types', async () => {
      const segments = [
        {
          start: mockStartPoint,
          end: { lat: 40.73, lng: -73.99 },
          type: 'BIKE' as RouteType,
          preferences: {
            optimize: 'SPEED' as OptimizationPreference,
            bikeType: 'road'
          }
        },
        {
          start: { lat: 40.73, lng: -73.99 },
          end: mockEndPoint,
          type: 'BIKE' as RouteType,
          preferences: {
            optimize: 'TERRAIN' as OptimizationPreference,
            bikeType: 'mountain'
          }
        }
      ];

      mockMCPService.getTerrainConditions = jest.fn()
        .mockImplementation((location: GeoPoint) => {
          return Promise.resolve({
            elevation: 100,
            surface: location.lat > 40.73 ? 'trail' : 'paved',
            difficulty: location.lat > 40.73 ? 'technical' : 'easy',
            features: location.lat > 40.73 ? ['trail', 'mountain'] : ['road', 'flat']
          });
        });

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.surfaceType).toBe('paved');
      expect(route.segments[1].metrics.surfaceType).toBe('trail');
    });
  });

  describe('Walk Routes', () => {
    it('should optimize for pedestrian preferences', async () => {
      const segments: RouteSegment[] = [{
        start: mockStartPoint,
        end: mockEndPoint,
        type: 'WALK' as RouteType,
        preferences: {
          optimize: 'SCENIC' as OptimizationPreference,
          preferParks: true,
          avoidTraffic: true,
          accessibility: 'high'
        }
      }];

      mockPOIService.getNearbyPOIs = jest.fn().mockResolvedValue([
        { type: 'park', location: { lat: 40.72, lng: -73.98 } },
        { type: 'viewpoint', location: { lat: 40.73, lng: -73.99 } }
      ]);

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments[0].metrics.scenicValue).toBeGreaterThan(0.7);
      expect(route.segments[0].metrics.accessibility).toBe('high');
    });

    it('should handle urban exploration routes', async () => {
      const segments = Array(3).fill(null).map((_, index) => ({
        start: {
          lat: mockStartPoint.lat + (index * 0.01),
          lng: mockStartPoint.lng + (index * 0.01)
        },
        end: {
          lat: mockStartPoint.lat + ((index + 1) * 0.01),
          lng: mockStartPoint.lng + ((index + 1) * 0.01)
        },
        type: 'WALK' as RouteType,
        preferences: {
          optimize: 'POINTS_OF_INTEREST' as OptimizationPreference,
          maxDetour: 0.2, // 20% detour allowed
          poiTypes: ['historic', 'cultural', 'viewpoint']
        }
      }));

      mockPOIService.getNearbyPOIs = jest.fn()
        .mockImplementation(() => Promise.resolve([
          { type: 'historic', location: { lat: 40.72, lng: -73.98 } },
          { type: 'cultural', location: { lat: 40.73, lng: -73.99 } },
          { type: 'viewpoint', location: { lat: 40.74, lng: -74.00 } }
        ]));

      const route = await routeService.createMultiSegmentRoute(segments);
      expect(route.segments).toHaveLength(3);
      route.segments.forEach(segment => {
        expect(segment.metrics.pointsOfInterest.length).toBeGreaterThan(0);
      });
    });
  });
}); 