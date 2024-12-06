import { CarRouteOptimizer } from '@/services/route/CarRouteOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { ActivityType } from '@/types/activity/types';
import { OptimizationPreference } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/integration/MCPIntegrationService');

describe('CarRouteOptimizer', () => {
  let carOptimizer: CarRouteOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPIntegrationService>;

  const mockStartPoint = { lat: 40.7128, lng: -74.0060 };
  const mockEndPoint = { lat: 40.7589, lng: -73.9851 };

  beforeEach(() => {
    mockWeatherService = {
      getWeatherForLocation: jest.fn().mockResolvedValue({
        temperature: 20,
        conditions: 'clear',
        windSpeed: 10,
        visibility: 10000
      })
    } as any;

    mockMCPService = {
      getTrafficData: jest.fn().mockResolvedValue({
        segments: [
          {
            start: mockStartPoint,
            end: mockEndPoint,
            congestionLevel: 0.3,
            length: 1000
          }
        ],
        trafficLights: [],
        stopSigns: [],
        incidents: [],
        majorIntersections: []
      }),
      getRoadConditions: jest.fn().mockResolvedValue({
        overall: 'good',
        segments: [],
        warnings: []
      }),
      getRoadRestrictions: jest.fn().mockResolvedValue({
        segments: []
      }),
      getElevationProfile: jest.fn().mockResolvedValue([0, 10, 20, 10, 0]),
      getBaseRoute: jest.fn().mockResolvedValue([mockStartPoint, mockEndPoint]),
      getAlternativeRoutes: jest.fn().mockResolvedValue([]),
      getFastestCarRoute: jest.fn().mockResolvedValue({
        path: [mockStartPoint, mockEndPoint],
        metrics: {}
      }),
      getFuelEfficientRoute: jest.fn().mockResolvedValue({
        path: [mockStartPoint, mockEndPoint],
        metrics: {}
      }),
      getScenicCarRoute: jest.fn().mockResolvedValue({
        path: [mockStartPoint, mockEndPoint],
        metrics: {}
      })
    } as any;

    carOptimizer = new CarRouteOptimizer(mockWeatherService, mockMCPService);
  });

  describe('optimizeRoute', () => {
    it('should calculate basic route metrics correctly', async () => {
      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('distance');
      expect(result.metrics).toHaveProperty('duration');
      expect(result.metrics).toHaveProperty('fuelEfficiency');
      expect(result.metrics).toHaveProperty('trafficDelay');
      expect(result.metrics).toHaveProperty('stopCount');
    });

    it('should adjust duration for bad weather conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValueOnce({
        temperature: 20,
        conditions: 'rain',
        windSpeed: 10,
        visibility: 5000
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      const baseResult = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(result.metrics.duration).toBeGreaterThan(baseResult.metrics.duration);
    });

    it('should adjust route for traffic conditions', async () => {
      mockMCPService.getTrafficData.mockResolvedValueOnce({
        segments: [
          {
            start: mockStartPoint,
            end: mockEndPoint,
            congestionLevel: 0.8,
            length: 1000
          }
        ],
        trafficLights: [],
        stopSigns: [],
        incidents: [],
        majorIntersections: []
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR,
          avoidTraffic: true
        }
      );

      expect(mockMCPService.getAlternativeRoutes).toHaveBeenCalled();
      expect(result.warnings).toContain('Heavy traffic conditions');
    });

    it('should optimize for fuel efficiency when requested', async () => {
      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.FUEL_EFFICIENCY,
          activityType: ActivityType.CAR
        }
      );

      expect(mockMCPService.getFuelEfficientRoute).toHaveBeenCalled();
      expect(result.metrics.fuelEfficiency).toBeDefined();
    });

    it('should generate appropriate warnings for poor conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValueOnce({
        temperature: 20,
        conditions: 'snow',
        windSpeed: 60,
        visibility: 500
      });

      mockMCPService.getRoadConditions.mockResolvedValueOnce({
        overall: 'poor',
        segments: [],
        warnings: [],
        construction: true,
        hazards: ['ice']
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(result.warnings).toContain('Snowy conditions - reduce speed');
      expect(result.warnings).toContain('Poor visibility conditions');
      expect(result.warnings).toContain('Strong winds - high-profile vehicles use caution');
      expect(result.warnings).toContain('Poor road conditions ahead');
      expect(result.warnings).toContain('Construction zones on route');
      expect(result.warnings).toContain('Road hazards reported');
    });

    it('should handle road restrictions correctly', async () => {
      mockMCPService.getRoadRestrictions.mockResolvedValueOnce({
        segments: [
          {
            start: mockStartPoint,
            end: mockEndPoint,
            restricted: true
          }
        ]
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(mockMCPService.getAlternativeRoutes).toHaveBeenCalled();
      expect(result.path).toBeDefined();
    });

    it('should calculate stop count correctly', async () => {
      mockMCPService.getTrafficData.mockResolvedValueOnce({
        segments: [
          {
            start: mockStartPoint,
            end: mockEndPoint,
            congestionLevel: 0.5,
            length: 1000
          }
        ],
        trafficLights: [{ location: { lat: 40.72, lng: -74.0 } }],
        stopSigns: [{ location: { lat: 40.73, lng: -74.0 } }],
        incidents: [],
        majorIntersections: []
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(result.metrics.stopCount).toBeGreaterThanOrEqual(2); // At least traffic light + stop sign
    });

    it('should generate appropriate waypoints', async () => {
      mockMCPService.getTrafficData.mockResolvedValueOnce({
        segments: [
          {
            start: mockStartPoint,
            end: mockEndPoint,
            congestionLevel: 0.5,
            length: 1000
          }
        ],
        trafficLights: [],
        stopSigns: [],
        incidents: [{ location: { lat: 40.72, lng: -74.0 }, type: 'accident' }],
        majorIntersections: [{ location: { lat: 40.73, lng: -74.0 } }]
      });

      const result = await carOptimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        }
      );

      expect(result.waypoints).toHaveLength(2); // Traffic incident + major intersection
      expect(result.waypoints[0].type).toBe('traffic_incident');
      expect(result.waypoints[1].type).toBe('major_intersection');
    });
  });
}); 