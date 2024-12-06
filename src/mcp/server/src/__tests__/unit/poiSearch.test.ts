import { describe, it, expect, beforeEach } from 'vitest';
import { POIService } from '../../services/POIService';
import { POICategory } from '../../types';
import { ActivityType } from '../../../../types/mcp.types';

describe('POI Service', () => {
  let service: POIService;

  beforeEach(() => {
    service = new POIService();
  });

  describe('Search Functionality', () => {
    it('should find nearby POIs', async () => {
      const request = {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 1000,
        activityType: ActivityType.WALK,
        categories: [POICategory.RESTAURANT, POICategory.CAFE]
      };

      const result = await service.searchPOIs(request);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.metadata.categories).toContain(POICategory.RESTAURANT);
      expect(result.metadata.radius).toBe(1000);
    });

    it('should validate location coordinates', async () => {
      const request = {
        location: { lat: 91, lng: -122.4194 }, // Invalid latitude
        radius: 1000,
        activityType: ActivityType.WALK,
        categories: [POICategory.RESTAURANT]
      };

      await expect(service.searchPOIs(request)).rejects.toThrow();
    });

    it('should validate search radius', async () => {
      const request = {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: -1000, // Invalid radius
        activityType: ActivityType.WALK,
        categories: [POICategory.RESTAURANT]
      };

      await expect(service.searchPOIs(request)).rejects.toThrow();
    });

    it('should validate POI categories', async () => {
      const request = {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 1000,
        activityType: ActivityType.WALK,
        categories: ['invalid' as POICategory]
      };

      await expect(service.searchPOIs(request)).rejects.toThrow();
    });
  });

  describe('Caching', () => {
    it('should use cache when available', async () => {
      const request = {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 500,
        activityType: ActivityType.WALK,
        categories: [POICategory.RESTAURANT]
      };

      // First call should miss cache
      const firstResult = await service.searchPOIs(request);
      // Second call should hit cache
      const secondResult = await service.searchPOIs(request);

      expect(firstResult).toEqual(secondResult);
    });
  });
}); 