import { describe, it, expect, beforeEach } from 'vitest';
import { WeatherService } from '../../services/WeatherService';
import { POIService } from '../../services/POIService';
import { ActivityType, WeatherConditions } from '../../../../types/mcp.types';

describe('Services', () => {
  describe('WeatherService', () => {
    let weatherService: WeatherService;

    beforeEach(() => {
      weatherService = new WeatherService();
    });

    it('should get current weather conditions', async () => {
      const conditions = await weatherService.getCurrentConditions({
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.7749, lng: -122.4194 },
        preferences: {
          activityType: ActivityType.WALK
        }
      });

      expect(conditions).toEqual({
        temperature: 15,
        feelsLike: 12,
        humidity: 90,
        windSpeed: 25,
        precipitation: {
          type: 'rain',
          intensity: 'heavy'
        },
        condition: 'STORM',
        visibility: 2000
      } as WeatherConditions);
    });

    // ... rest of tests ...
  });

  describe('POIService', () => {
    let poiService: POIService;

    beforeEach(() => {
      poiService = new POIService();
    });

    it('should search for POIs', async () => {
      const result = await poiService.searchPOIs({
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 1000,
        activityType: ActivityType.WALK,
        categories: ['restaurant', 'cafe']
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.metadata.categories).toContain('restaurant');
      expect(result.metadata.radius).toBe(1000);
    });
  });
}); 