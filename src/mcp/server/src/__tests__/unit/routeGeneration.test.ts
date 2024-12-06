import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import { POIService } from '../../services/POIService';
import { WeatherService } from '../../services/WeatherService';
import { ActivityType, POIRecommendation } from '../../../../types/mcp.types';
import { POICategory } from '../../types';

vi.mock('../../services/POIService');
vi.mock('../../services/WeatherService');

describe('Route Generation', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({
      anthropicApiKey: 'test-key',
      metricsEnabled: true
    });
  });

  it('should generate a route with POIs', async () => {
    const mockPOIs = {
      results: [{
        id: 'test-poi',
        name: 'Test POI',
        category: POICategory.RESTAURANT,
        location: { lat: 37.7749, lng: -122.4194 },
        recommendedActivities: [ActivityType.WALK],
        confidence: 0.9,
        details: {
          description: 'Test description',
          openingHours: '9:00-17:00',
          amenities: ['parking', 'wifi'],
          ratings: {
            overall: 4.5,
            aspects: {
              safety: 0.9
            }
          }
        }
      }],
      metadata: {
        total: 1,
        radius: 1000,
        categories: [POICategory.RESTAURANT],
        searchTime: Date.now()
      }
    };

    const mockWeather = {
      temperature: 20,
      windSpeed: 5,
      precipitation: {
        type: 'none',
        intensity: 'none'
      },
      visibility: 10000
    };

    vi.mocked(POIService.prototype.searchPOIs).mockResolvedValue(mockPOIs);
    vi.mocked(WeatherService.prototype.getWeatherForRoute).mockResolvedValue(mockWeather);

    const request = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.7751, lng: -122.4196 },
      preferences: {
        activityType: ActivityType.WALK,
        includePointsOfInterest: true,
        poiCategories: [POICategory.RESTAURANT]
      }
    };

    const response = await server.generateRoute(request);
    expect(response.route).toBeDefined();
    expect(response.suggestedPOIs).toBeDefined();
    expect(response.suggestedPOIs?.length).toBeGreaterThan(0);
  });
}); 