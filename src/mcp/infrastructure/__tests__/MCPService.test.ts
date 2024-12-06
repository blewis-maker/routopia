import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MCPService } from '../MCPService';
import { AIService } from '../../../services/ai/AIService';
import { POIService } from '../../server/src/services/POIService';
import { WeatherService } from '../../server/src/services/WeatherService';
import type {
  RouteContext,
  MCPResponse,
  WeatherConditions,
  TrafficConditions,
  POIRecommendation
} from '../../types/mcp.types';
import { ActivityType } from '../../../types/activities';

// Mock services
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

vi.mock('../../server/src/services/POIService');
vi.mock('../../server/src/services/WeatherService');

describe('MCPService', () => {
  let service: MCPService;
  let mockWeather: WeatherConditions;
  let mockTraffic: TrafficConditions;
  let mockPOIs: POISearchResult;

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

    mockPOIs = {
      results: [{
        id: 'test-poi',
        name: 'Test POI',
        category: 'restaurant',
        location: { lat: 37.7749, lng: -122.4194 },
        recommendedActivities: [ActivityType.WALK],
        confidence: 0.9,
        details: {
          description: 'Test restaurant',
          openingHours: '9:00-17:00',
          amenities: ['parking', 'wifi', 'outdoor_seating'],
          ratings: {
            overall: 4.5,
            aspects: {
              safety: 0.9,
              accessibility: 0.85,
              familyFriendly: 0.95
            }
          }
        }
      }],
      metadata: {
        total: 1,
        radius: 1000,
        categories: ['restaurant'],
        searchTime: Date.now()
      }
    };

    vi.mocked(POIService.prototype.searchPOIs).mockResolvedValue(mockPOIs);
    vi.mocked(WeatherService.prototype.getWeatherForRoute).mockResolvedValue(mockWeather);

    service = new MCPService();
  });

  describe('Route Generation', () => {
    it('should generate a basic route', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      const result = await service.generateRoute(context);

      expect(result).toBeDefined();
      expect(result.route[0].activityType).toBe('WALK');
      expect(result.metadata.mainRouteType).toBe('WALK');
    });

    it('should include POI recommendations', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK',
          urbanPreferences: {
            safetyPriority: 'high'
          }
        }
      };

      const result = await service.generateRoute(context);

      expect(result.suggestedPOIs).toBeDefined();
      expect(result.suggestedPOIs?.length).toBeGreaterThan(0);
      expect(result.suggestedPOIs?.[0].recommendedActivities).toContain('WALK');
    });

    it('should include weather and traffic conditions', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      const result = await service.generateRoute(context);

      expect(result.metadata.conditions.weather).toBeDefined();
      expect(result.metadata.conditions.traffic).toBeDefined();
      expect(result.metadata.conditions.weather.temperature).toBe(20);
      expect(result.metadata.conditions.traffic?.congestionLevel).toBe('low');
    });
  });

  describe('Caching', () => {
    it('should cache and return cached responses', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      // First call
      const result1 = await service.generateRoute(context);

      // Second call with same context
      const result2 = await service.generateRoute(context);

      expect(result1).toEqual(result2);
      expect(POIService.prototype.searchPOIs).toHaveBeenCalledTimes(1);
    });

    it('should not use cache for different contexts', async () => {
      const context1: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      const context2: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'BIKE'
        }
      };

      await service.generateRoute(context1);
      await service.generateRoute(context2);

      expect(POIService.prototype.searchPOIs).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle POI service errors', async () => {
      vi.mocked(POIService.prototype.searchPOIs).mockRejectedValueOnce(
        new Error('POI service error')
      );

      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      await expect(service.generateRoute(context)).rejects.toThrow('POI service error');
    });

    it('should handle weather service errors', async () => {
      vi.mocked(WeatherService.prototype.getWeatherForRoute).mockRejectedValueOnce(
        new Error('Weather service error')
      );

      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK'
        }
      };

      await expect(service.generateRoute(context)).rejects.toThrow('Weather service error');
    });
  });

  describe('Activity-Specific Behavior', () => {
    it('should handle walking routes', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'WALK',
          urbanPreferences: {
            safetyPriority: 'high',
            lightingRequired: true
          }
        }
      };

      const result = await service.generateRoute(context);

      expect(result.route[0].activityType).toBe('WALK');
      expect(result.metadata.difficulty).toBeDefined();
      expect(result.metadata.scenicRating).toBeDefined();
    });

    it('should handle biking routes', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'BIKE',
          trainingPreferences: {
            targetPower: 250,
            intervalType: 'threshold'
          }
        }
      };

      const result = await service.generateRoute(context);

      expect(result.route[0].activityType).toBe('BIKE');
      expect(result.metadata.totalElevationGain).toBeGreaterThan(0);
    });

    it('should handle skiing routes', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 39.6403, lng: -106.3742 },
        preferences: {
          activityType: 'SKI',
          winterPreferences: {
            difficulty: 'advanced',
            minSnowDepth: 20
          }
        }
      };

      const result = await service.generateRoute(context);

      expect(result.route[0].activityType).toBe('SKI');
      expect(result.metadata.conditions.weather.snowDepth).toBeDefined();
    });
  });
}); 