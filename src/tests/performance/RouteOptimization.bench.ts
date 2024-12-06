import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { ActivityType, ActivitySegment } from '@/types/activity/types';
import { OptimizationPreference } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/integration/MCPIntegrationService');

describe('Route Optimization Performance', () => {
  let optimizer: RealTimeOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPIntegrationService>;

  const generatePoints = (count: number) => {
    const points = [];
    const basePoint = { lat: 40.7128, lng: -74.0060 };
    for (let i = 0; i < count; i++) {
      points.push({
        lat: basePoint.lat + (i * 0.01),
        lng: basePoint.lng + (i * 0.01)
      });
    }
    return points;
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

  describe('Single Segment Performance', () => {
    it('should optimize simple routes within 100ms', async () => {
      const points = generatePoints(2);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        }
      ];

      const startTime = Date.now();
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should handle complex routes within 200ms', async () => {
      mockMCPService.getTrafficData.mockResolvedValue({
        segments: Array(100).fill({
          congestionLevel: 0.5,
          length: 100
        }),
        trafficLights: Array(20).fill({}),
        stopSigns: Array(10).fill({}),
        incidents: Array(5).fill({}),
        majorIntersections: Array(10).fill({})
      });

      const points = generatePoints(2);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        }
      ];

      const startTime = Date.now();
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR,
        avoidTraffic: true,
        preferScenic: true
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Multi-Segment Performance', () => {
    it('should handle 5-segment routes within 500ms', async () => {
      const points = generatePoints(6);
      const segments: ActivitySegment[] = [];
      
      for (let i = 0; i < 5; i++) {
        segments.push({
          type: ActivityType.WALK,
          startPoint: points[i],
          endPoint: points[i + 1],
          metrics: null,
          waypoints: []
        });
      }

      const startTime = Date.now();
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });

    it('should optimize mixed activity routes within 1000ms', async () => {
      const points = generatePoints(4);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: points[1],
          endPoint: points[2],
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.BIKE,
          startPoint: points[2],
          endPoint: points[3],
          metrics: null,
          waypoints: []
        }
      ];

      const startTime = Date.now();
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.CAR
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Optimization Performance', () => {
    it('should handle 10 concurrent optimizations within 2000ms', async () => {
      const points = generatePoints(2);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        }
      ];

      const startTime = Date.now();
      const promises = Array(10).fill(null).map(() =>
        optimizer.optimizeMultiSegmentRoute(segments, {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.WALK
        })
      );

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
    });

    it('should maintain performance under load', async () => {
      const points = generatePoints(3);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.CAR,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        },
        {
          type: ActivityType.WALK,
          startPoint: points[1],
          endPoint: points[2],
          metrics: null,
          waypoints: []
        }
      ];

      const durations: number[] = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await optimizer.optimizeMultiSegmentRoute(segments, {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.CAR
        });
        durations.push(Date.now() - startTime);
      }

      const averageDuration = durations.reduce((a, b) => a + b) / durations.length;
      const maxDuration = Math.max(...durations);
      const variance = Math.sqrt(
        durations.reduce((acc, val) => acc + Math.pow(val - averageDuration, 2), 0) / durations.length
      );

      expect(averageDuration).toBeLessThan(300);
      expect(maxDuration).toBeLessThan(500);
      expect(variance).toBeLessThan(100);
    });
  });

  describe('Memory Usage', () => {
    it('should handle large route data efficiently', async () => {
      const points = generatePoints(100);
      const segments: ActivitySegment[] = [];
      
      for (let i = 0; i < 99; i++) {
        segments.push({
          type: ActivityType.WALK,
          startPoint: points[i],
          endPoint: points[i + 1],
          metrics: null,
          waypoints: []
        });
      }

      const initialMemory = process.memoryUsage().heapUsed;
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });
      const finalMemory = process.memoryUsage().heapUsed;

      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      expect(memoryIncrease).toBeLessThan(50);
    });

    it('should clean up resources after optimization', async () => {
      const points = generatePoints(10);
      const segments: ActivitySegment[] = [];
      
      for (let i = 0; i < 9; i++) {
        segments.push({
          type: ActivityType.WALK,
          startPoint: points[i],
          endPoint: points[i + 1],
          metrics: null,
          waypoints: []
        });
      }

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run multiple optimizations
      for (let i = 0; i < 10; i++) {
        await optimizer.optimizeMultiSegmentRoute(segments, {
          optimize: OptimizationPreference.TIME,
          activityType: ActivityType.WALK
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      expect(memoryIncrease).toBeLessThan(10);
    });
  });

  describe('Service Response Times', () => {
    it('should handle slow weather service gracefully', async () => {
      mockWeatherService.getWeatherForLocation.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const points = generatePoints(2);
      const segments: ActivitySegment[] = [
        {
          type: ActivityType.WALK,
          startPoint: points[0],
          endPoint: points[1],
          metrics: null,
          waypoints: []
        }
      ];

      const startTime = Date.now();
      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1500); // Allow some overhead
    });

    it('should optimize service calls for multi-segment routes', async () => {
      let weatherCalls = 0;
      let terrainCalls = 0;

      mockWeatherService.getWeatherForLocation.mockImplementation(async () => {
        weatherCalls++;
        return {
          temperature: 20,
          conditions: 'clear',
          windSpeed: 10,
          visibility: 10000
        };
      });

      mockMCPService.getTerrainConditions.mockImplementation(async () => {
        terrainCalls++;
        return {
          type: 'urban',
          difficulty: 'moderate',
          surface: 'paved'
        };
      });

      const points = generatePoints(5);
      const segments: ActivitySegment[] = [];
      
      for (let i = 0; i < 4; i++) {
        segments.push({
          type: ActivityType.WALK,
          startPoint: points[i],
          endPoint: points[i + 1],
          metrics: null,
          waypoints: []
        });
      }

      await optimizer.optimizeMultiSegmentRoute(segments, {
        optimize: OptimizationPreference.TIME,
        activityType: ActivityType.WALK
      });

      // Should batch or cache similar requests
      expect(weatherCalls).toBeLessThan(segments.length * 2);
      expect(terrainCalls).toBeLessThan(segments.length * 2);
    });
  });
}); 
}); 