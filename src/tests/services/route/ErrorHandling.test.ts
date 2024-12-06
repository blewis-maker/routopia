import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { ActivityType, ActivitySegment } from '@/types/activity/types';
import { OptimizationPreference } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/integration/MCPIntegrationService');

describe('Route Optimization Error Handling', () => {
  let optimizer: RealTimeOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPIntegrationService>;

  const mockPoints = {
    start: { lat: 40.7128, lng: -74.0060 },
    middle: { lat: 40.7589, lng: -73.9851 },
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
        segments: [],
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
      getBaseRoute: jest.fn().mockImplementation((start, end) => [start, end])
    } as any;

    optimizer = new RealTimeOptimizer(mockWeatherService, mockMCPService);
  });

  describe('Service Failures', () => {
    it('should handle weather service failures gracefully', async () => {
      mockWeatherService.getWeatherForLocation.mockRejectedValue(
        new Error('Weather service unavailable')
      );

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.start,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });

      expect(result).toBeDefined();
      expect(result.segments[0].metrics).toBeDefined();
      expect(result.segments[0].metrics.weather).toBeNull();
    });

    it('should handle MCP service failures gracefully', async () => {
      mockMCPService.getTrafficData.mockRejectedValue(
        new Error('Traffic data unavailable')
      );

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result).toBeDefined();
      expect(result.segments[0].metrics.trafficDelay).toBe(0);
      expect(result.warnings).toContain('Traffic data unavailable');
    });

    it('should handle terrain service failures gracefully', async () => {
      mockMCPService.getTerrainConditions.mockRejectedValue(
        new Error('Terrain data unavailable')
      );

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.start,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.BIKE
      });

      expect(result).toBeDefined();
      expect(result.segments[0].metrics.terrain).toBeNull();
      expect(result.warnings).toContain('Terrain data unavailable');
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid coordinates', async () => {
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: { lat: 91, lng: -74.0060 }, // Invalid latitude
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      await expect(
        optimizer.optimizeMultiSegmentRoute(segments, {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.WALK
        })
      ).rejects.toThrow('Invalid coordinates');
    });

    it('should handle empty segment array', async () => {
      await expect(
        optimizer.optimizeMultiSegmentRoute([], {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.WALK
        })
      ).rejects.toThrow('No segments provided');
    });

    it('should handle invalid activity types', async () => {
      const segments: ActivitySegment[] = [
        {
          type: 'INVALID' as ActivityType,
          startPoint: mockPoints.start,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      await expect(
        optimizer.optimizeMultiSegmentRoute(segments, {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.WALK
        })
      ).rejects.toThrow('Invalid activity type');
    });
  });

  describe('Partial Data Handling', () => {
    it('should handle missing weather data for some segments', async () => {
      mockWeatherService.getWeatherForLocation
        .mockResolvedValueOnce({
          temperature: 20,
          conditions: 'clear',
          windSpeed: 10,
          visibility: 10000
        })
        .mockRejectedValueOnce(new Error('Weather data unavailable'))
        .mockResolvedValueOnce({
          temperature: 18,
          conditions: 'rain',
          windSpeed: 15,
          visibility: 5000
        });

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });

      expect(result.segments[0].metrics.weather).toBeDefined();
      expect(result.segments[1].metrics.weather).toBeNull();
      expect(result.warnings).toContain('Weather data partially unavailable');
    });

    it('should handle missing terrain data for some segments', async () => {
      mockMCPService.getTerrainConditions
        .mockResolvedValueOnce({
          type: 'urban',
          difficulty: 'moderate',
          surface: 'paved'
        })
        .mockRejectedValueOnce(new Error('Terrain data unavailable'));

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: mockPoints.middle,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.BIKE
      });

      expect(result.segments[0].metrics.terrain).toBeDefined();
      expect(result.segments[1].metrics.terrain).toBeNull();
      expect(result.warnings).toContain('Terrain data partially unavailable');
    });
  });

  describe('Recovery Strategies', () => {
    it('should use fallback values when services fail', async () => {
      mockMCPService.getTrafficData.mockRejectedValue(
        new Error('Traffic data unavailable')
      );
      mockMCPService.getRoadConditions.mockRejectedValue(
        new Error('Road conditions unavailable')
      );

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result.segments[0].metrics.trafficDelay).toBe(0);
      expect(result.segments[0].metrics.stopCount).toBe(0);
      expect(result.warnings).toContain('Using default traffic conditions');
    });

    it('should handle concurrent service failures', async () => {
      mockWeatherService.getWeatherForLocation.mockRejectedValue(
        new Error('Weather service unavailable')
      );
      mockMCPService.getTrafficData.mockRejectedValue(
        new Error('Traffic data unavailable')
      );
      mockMCPService.getTerrainConditions.mockRejectedValue(
        new Error('Terrain data unavailable')
      );

      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: mockPoints.middle,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result).toBeDefined();
      expect(result.segments).toHaveLength(2);
      expect(result.warnings).toContain('Multiple services unavailable');
      expect(result.warnings).toContain('Using fallback optimization strategy');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-distance routes', async () => {
      const samePoint = mockPoints.start;
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: samePoint,
          endPoint: samePoint,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });

      expect(result.segments[0].metrics.distance).toBe(0);
      expect(result.segments[0].metrics.duration).toBe(0);
      expect(result.warnings).toContain('Zero-distance route segment detected');
    });

    it('should handle extremely long routes', async () => {
      const veryFarPoint = { lat: 40.7128, lng: 0 }; // Across the ocean
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: veryFarPoint,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result.warnings).toContain('Route distance exceeds recommended limit');
      expect(result.warnings).toContain('Optimization may be less accurate');
    });

    it('should handle invalid segment transitions', async () => {
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: mockPoints.start,
          endPoint: mockPoints.middle,
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.SKI,
          startPoint: mockPoints.middle,
          endPoint: mockPoints.end,
          metrics: null,
          waypoints: []
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });

      expect(result.warnings).toContain('Unusual activity type transition detected');
      expect(result.transitions[0].duration).toBeGreaterThan(600); // Extra transition time
    });
  });
}); 