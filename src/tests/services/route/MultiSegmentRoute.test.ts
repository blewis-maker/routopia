import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { ActivityType, ActivitySegment } from '@/types/activity/types';
import { OptimizationPreference } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/integration/MCPIntegrationService');

describe('MultiSegmentRoute', () => {
  let optimizer: RealTimeOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPIntegrationService>;

  const mockPoints = {
    start: { lat: 40.7128, lng: -74.0060 },
    middle1: { lat: 40.7589, lng: -73.9851 },
    middle2: { lat: 40.7829, lng: -73.9654 },
    end: { lat: 40.7931, lng: -73.9712 }
  };

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
            start: mockPoints.start,
            end: mockPoints.middle1,
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
      getTerrainConditions: jest.fn().mockResolvedValue({
        type: 'urban',
        difficulty: 'moderate',
        surface: 'paved'
      }),
      getElevationProfile: jest.fn().mockResolvedValue([0, 10, 20, 10, 0]),
      getBaseRoute: jest.fn().mockImplementation((start, end) => [start, end]),
      getBikeLanes: jest.fn().mockResolvedValue({
        lanes: [],
        transitions: []
      }),
      getSidewalks: jest.fn().mockResolvedValue({
        paths: [],
        crossings: []
      })
    } as any;

    optimizer = new RealTimeOptimizer(mockWeatherService, mockMCPService);
  });

  describe('optimizeMultiSegmentRoute', () => {
    it('should optimize a car-walk-bike route correctly', async () => {
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.middle2,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.middle2,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result.segments).toHaveLength(3);
      expect(result.transitions).toHaveLength(2);
      expect(result.totalMetrics).toBeDefined();
      expect(result.totalMetrics.distance).toBeGreaterThan(0);
      expect(result.totalMetrics.duration).toBeGreaterThan(0);
    });

    it('should handle weather-affected transitions correctly', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValueOnce({
        temperature: 20,
        conditions: 'rain',
        windSpeed: 15,
        visibility: 8000
      });

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result.transitions[0].duration).toBeGreaterThan(180); // Base bike transition time
    });

    it('should calculate accurate total metrics', async () => {
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });

      const totalDistance = result.segments.reduce(
        (sum, segment) => sum + segment.metrics.distance,
        0
      );
      const totalDuration = result.segments.reduce(
        (sum, segment) => sum + segment.metrics.duration,
        0
      );

      expect(result.totalMetrics.distance).toBe(totalDistance);
      expect(result.totalMetrics.duration).toBe(
        totalDuration + result.transitions[0].duration
      );
    });

    it('should handle terrain changes between segments', async () => {
      mockMCPService.getTerrainConditions
        .mockResolvedValueOnce({
          type: 'urban',
          difficulty: 'easy',
          surface: 'paved'
        })
        .mockResolvedValueOnce({
          type: 'trail',
          difficulty: 'moderate',
          surface: 'unpaved'
        });

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.BIKE
      });

      expect(result.segments[0].metrics.terrain.type).toBe('urban');
      expect(result.segments[1].metrics.terrain.type).toBe('trail');
    });

    it('should optimize transitions for efficiency', async () => {
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.middle2,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.middle2,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      // Verify that transitions are ordered correctly
      expect(result.transitions[0].fromType).toBe(ActivityType.CAR);
      expect(result.transitions[0].toType).toBe(ActivityType.WALK);
      expect(result.transitions[1].fromType).toBe(ActivityType.WALK);
      expect(result.transitions[1].toType).toBe(ActivityType.BIKE);

      // Verify that transition points are optimized
      expect(result.transitions[0].point).toEqual(mockPoints.middle1);
      expect(result.transitions[1].point).toEqual(mockPoints.middle2);
    });

    it('should handle complex weather scenarios', async () => {
      // Simulate changing weather conditions along the route
      mockWeatherService.getWeatherForLocation
        .mockResolvedValueOnce({
          temperature: 20,
          conditions: 'clear',
          windSpeed: 10,
          visibility: 10000
        })
        .mockResolvedValueOnce({
          temperature: 18,
          conditions: 'rain',
          windSpeed: 15,
          visibility: 5000
        })
        .mockResolvedValueOnce({
          temperature: 17,
          conditions: 'rain',
          windSpeed: 20,
          visibility: 3000
        });

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle1,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle1,
          endPoint: mockPoints.middle2,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.middle2,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      // Verify that each segment has appropriate weather adjustments
      expect(result.segments[0].metrics.weather.conditions).toBe('clear');
      expect(result.segments[1].metrics.weather.conditions).toBe('rain');
      expect(result.segments[2].metrics.weather.conditions).toBe('rain');

      // Later segments should have longer durations due to weather
      const durationPerDistance1 = result.segments[0].metrics.duration / result.segments[0].metrics.distance;
      const durationPerDistance2 = result.segments[1].metrics.duration / result.segments[1].metrics.distance;
      const durationPerDistance3 = result.segments[2].metrics.duration / result.segments[2].metrics.distance;

      expect(durationPerDistance2).toBeGreaterThan(durationPerDistance1);
      expect(durationPerDistance3).toBeGreaterThan(durationPerDistance1);
    });
  });
}); 