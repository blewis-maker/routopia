import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MCPIntegrationService } from '../MCPIntegrationService';
import type { 
  RouteContext,
  ActivityType,
  GeoPoint,
  WeatherConditions,
  TrafficConditions,
  MCPResponse
} from '../../types/mcp.types';

// Mock all required services
vi.mock('../../../services/ai/AIService', () => ({
  AIService: {
    getInstance: vi.fn().mockReturnValue({
      process: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          route: [],
          metadata: {
            totalDistance: 1000,
            totalDuration: 720,
            totalElevationGain: 10,
            difficulty: 'EASY',
            scenicRating: 4,
            mainRouteType: 'CAR',
            tributaryActivities: ['WALK', 'BIKE'],
            conditions: {
              weather: {},
              traffic: {}
            },
            timing: {}
          }
        })
      })
    })
  }
}));

vi.mock('../../../services/ActivityOptimizer');
vi.mock('../../../services/DynamicExperienceOptimizer');
vi.mock('../MCPService');
vi.mock('../../server/src/services/POIService');
vi.mock('../../server/src/services/RouteService');
vi.mock('../../server/src/services/ActivityService');
vi.mock('../../server/src/services/WeatherService');

describe('MCPIntegrationService', () => {
  let service: MCPIntegrationService;
  let mockWeather: WeatherConditions;
  let mockTraffic: TrafficConditions;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWeather = {
      temperature: 20,
      windSpeed: 10,
      precipitation: {
        type: 'none',
        intensity: 'none'
      },
      visibility: 10000
    };

    mockTraffic = {
      congestionLevel: 'low',
      averageSpeed: 65,
      predictedDelays: 0
    };

    service = new MCPIntegrationService();
  });

  describe('Core Integration', () => {
    it('should integrate all services for route generation', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK',
          activityCategory: 'FITNESS'
        },
        currentConditions: {
          weather: mockWeather,
          traffic: mockTraffic
        }
      };

      const result = await service.generateEnhancedRoute(context);

      expect(result).toBeDefined();
      expect(result.metadata.mainRouteType).toBe('CAR');
      expect(result.metadata.tributaryActivities).toContain('WALK');
    });

    it('should handle the river and tributaries pattern', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 39.6403, lng: -106.3742 },
        preferences: {
          activityType: 'SKI',
          activityCategory: 'WINTER_SPORT',
          winterPreferences: {
            difficulty: 'advanced',
            minSnowDepth: 20
          }
        }
      };

      const result = await service.generateEnhancedRoute(context);

      // Verify main route (river)
      expect(result.route[0].activityType).toBe('CAR');
      expect(result.route[0].segmentType).toBe('MAIN');

      // Verify tributaries
      const tributaries = result.route.filter(segment => 
        segment.segmentType === 'TRIBUTARY'
      );
      expect(tributaries.length).toBeGreaterThan(0);
      expect(tributaries[0].activityType).toBe('SKI');
    });
  });

  describe('Service Interactions', () => {
    it('should coordinate AI and activity optimization', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'BIKE',
          activityCategory: 'FITNESS',
          trainingPreferences: {
            targetPower: 250,
            intervalType: 'threshold'
          }
        }
      };

      const result = await service.generateEnhancedRoute(context);

      // Verify AI optimization
      expect(result.metadata.tributaryActivities).toContain('BIKE');
      expect(result.route.some(segment => 
        segment.activityType === 'BIKE' && 
        segment.conditions?.surface.includes('trail')
      )).toBe(true);
    });

    it('should integrate POI and weather services', async () => {
      const context: RouteContext = {
        startPoint: { lat: 39.9527, lng: -105.1686 },
        endPoint: { lat: 39.7436, lng: -104.9892 },
        preferences: {
          activityType: 'WALK',
          urbanPreferences: {
            safetyPriority: 'high'
          }
        }
      };

      const result = await service.generateEnhancedRoute(context);

      // Verify POI integration
      expect(result.suggestedPOIs).toBeDefined();
      expect(result.suggestedPOIs?.some(poi => 
        poi.recommendedActivities.includes('WALK')
      )).toBe(true);

      // Verify weather integration
      expect(result.metadata.conditions.weather).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service failures gracefully', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      // Mock service failure
      vi.mocked(service['weatherService'].getWeatherForRoute)
        .mockRejectedValueOnce(new Error('Weather service unavailable'));

      await expect(service.generateEnhancedRoute(context))
        .rejects
        .toThrow('Weather service unavailable');
    });
  });

  describe('Performance and Caching', () => {
    it('should cache POI results', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      // Make two identical requests
      await service.generateEnhancedRoute(context);
      await service.generateEnhancedRoute(context);

      // Verify POI service was only called once
      expect(service['poiService'].searchPOIs)
        .toHaveBeenCalledTimes(1);
    });

    it('should optimize AI requests', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      // Make multiple similar requests
      for (let i = 0; i < 3; i++) {
        await service.generateEnhancedRoute(context);
      }

      // Verify AI optimization
      expect(service['aiService'].process)
        .toHaveBeenCalledTimes(1);
    });
  });
});