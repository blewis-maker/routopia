import { MultiSegmentRouteOptimizer } from '../MultiSegmentRouteOptimizer';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { CarRouteOptimizer } from '../CarRouteOptimizer';
import { RouteSegment, TerrainDifficulty } from '@/types/route/types';

// Mock dependencies
jest.mock('@/services/integration/MCPIntegrationService');
jest.mock('../CarRouteOptimizer');

describe('MultiSegmentRouteOptimizer', () => {
  let multiSegmentOptimizer: MultiSegmentRouteOptimizer;
  let mockMcpService: jest.Mocked<MCPIntegrationService>;
  let mockCarRouteOptimizer: jest.Mocked<CarRouteOptimizer>;

  beforeEach(() => {
    mockMcpService = new MCPIntegrationService() as jest.Mocked<MCPIntegrationService>;
    mockCarRouteOptimizer = new CarRouteOptimizer(mockMcpService) as jest.Mocked<CarRouteOptimizer>;
    multiSegmentOptimizer = new MultiSegmentRouteOptimizer(mockMcpService, mockCarRouteOptimizer);

    // Setup common mock responses
    mockMcpService.getElevationProfile.mockResolvedValue({
      points: [
        { distance: 0, elevation: 100 },
        { distance: 500, elevation: 120 },
        { distance: 1000, elevation: 110 }
      ]
    });

    mockMcpService.getBaseRoute.mockResolvedValue({
      path: [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 }
      ],
      distance: 1000,
      duration: 600
    });

    mockCarRouteOptimizer.optimizeRoute.mockResolvedValue({
      path: [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 }
      ],
      metrics: {
        distance: 1000,
        duration: 600,
        elevation: {
          gain: 100,
          loss: 50,
          profile: []
        },
        safety: 0.9,
        weatherImpact: null,
        terrainDifficulty: TerrainDifficulty.MODERATE,
        surfaceType: 'paved'
      },
      warnings: []
    });
  });

  describe('optimizeMultiSegmentRoute', () => {
    it('should optimize a valid multi-segment route', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'CAR',
          preferences: {}
        },
        {
          startPoint: { lat: 1, lng: 1 },
          endPoint: { lat: 2, lng: 2 },
          activityType: 'WALK',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      expect(result).toHaveLength(3); // 2 segments + 1 transition
      expect(mockCarRouteOptimizer.optimizeRoute).toHaveBeenCalledTimes(1);
      expect(mockMcpService.getBaseRoute).toHaveBeenCalledTimes(1);
    });

    it('should throw error for empty segments array', async () => {
      await expect(
        multiSegmentOptimizer.optimizeMultiSegmentRoute([], {})
      ).rejects.toThrow('No segments provided');
    });

    it('should throw error for discontinuous segments', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'CAR',
          preferences: {}
        },
        {
          startPoint: { lat: 2, lng: 2 }, // Discontinuous point
          endPoint: { lat: 3, lng: 3 },
          activityType: 'WALK',
          preferences: {}
        }
      ];

      await expect(
        multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {})
      ).rejects.toThrow('Segment discontinuity');
    });
  });

  describe('segment type optimization', () => {
    it('should optimize walking segments correctly', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'WALK',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      expect(result[0].metrics.terrainDifficulty).toBe(TerrainDifficulty.EASY);
      expect(result[0].metrics.surfaceType).toBe('sidewalk');
    });

    it('should optimize biking segments correctly', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'BIKE',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      expect(result[0].metrics.terrainDifficulty).toBe(TerrainDifficulty.MODERATE);
      expect(result[0].metrics.surfaceType).toBe('bike_lane');
    });

    it('should optimize public transport segments correctly', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'PUBLIC_TRANSPORT',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      expect(result[0].metrics.terrainDifficulty).toBe(TerrainDifficulty.EASY);
      expect(result[0].metrics.surfaceType).toBe('rail');
    });
  });

  describe('transition handling', () => {
    it('should calculate correct transition durations', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'CAR',
          preferences: {}
        },
        {
          startPoint: { lat: 1, lng: 1 },
          endPoint: { lat: 2, lng: 2 },
          activityType: 'WALK',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      // Check the transition segment (index 1)
      expect(result[1].metrics.duration).toBe(300); // 5 minutes for CAR to WALK
      expect(result[1].metrics.distance).toBe(0);
      expect(result[1].metrics.surfaceType).toBe('transfer');
    });

    it('should handle complex transitions correctly', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'CAR',
          preferences: {}
        },
        {
          startPoint: { lat: 1, lng: 1 },
          endPoint: { lat: 2, lng: 2 },
          activityType: 'PUBLIC_TRANSPORT',
          preferences: {}
        },
        {
          startPoint: { lat: 2, lng: 2 },
          endPoint: { lat: 3, lng: 3 },
          activityType: 'BIKE',
          preferences: {}
        }
      ];

      const result = await multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {});
      
      // Check transitions
      expect(result[1].metrics.duration).toBe(600); // CAR to PUBLIC_TRANSPORT
      expect(result[3].metrics.duration).toBe(600); // PUBLIC_TRANSPORT to BIKE
    });
  });

  describe('error handling', () => {
    it('should handle MCP service errors gracefully', async () => {
      mockMcpService.getBaseRoute.mockRejectedValue(new Error('MCP service error'));

      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'WALK',
          preferences: {}
        }
      ];

      await expect(
        multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {})
      ).rejects.toThrow('Failed to optimize multi-segment route');
    });

    it('should handle invalid activity types', async () => {
      const segments: RouteSegment[] = [
        {
          startPoint: { lat: 0, lng: 0 },
          endPoint: { lat: 1, lng: 1 },
          activityType: 'INVALID_TYPE' as any,
          preferences: {}
        }
      ];

      await expect(
        multiSegmentOptimizer.optimizeMultiSegmentRoute(segments, {})
      ).rejects.toThrow('Unsupported activity type');
    });
  });
}); 