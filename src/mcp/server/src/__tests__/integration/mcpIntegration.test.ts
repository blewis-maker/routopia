import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCPServer } from '../../index';
import Redis from 'ioredis';
import { RouteGenerationRequest, POICategory, TextBlock } from '../../types';

describe('MCP Server Integration', () => {
  let server: MCPServer;
  let redis: Redis;

  beforeEach(async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 1 // Use a separate DB for testing
    });
    
    server = new MCPServer({
      anthropicApiKey: process.env.CLAUDE_API_KEY || 'test-key',
      metricsEnabled: true
    });

    await redis.flushdb(); // Clear test database
  });

  afterEach(async () => {
    await redis.quit();
  });

  describe('Claude API Integration', () => {
    it('should successfully interact with Claude API', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK',
          includePointsOfInterest: true,
          poiCategories: [POICategory.RESTAURANT, POICategory.CAFE]
        }
      };

      const response = await server.generateRoute(request);
      const textBlock = response.content[0] as TextBlock;
      expect(textBlock.type).toBe('text');
      expect(textBlock.text).toBeDefined();
      expect(textBlock.text.length).toBeGreaterThan(0);
    });

    it('should handle rate limiting gracefully', async () => {
      const requests = Array(5).fill(null).map(() => ({
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK' as const,
          includePointsOfInterest: true,
          poiCategories: [POICategory.RESTAURANT]
        }
      }));

      const responses = await Promise.allSettled(
        requests.map(req => server.generateRoute(req))
      );

      const fulfilled = responses.filter(r => r.status === 'fulfilled');
      expect(fulfilled.length).toBeGreaterThan(0);
    });
  });

  describe('Caching', () => {
    it('should cache and reuse responses', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK',
          includePointsOfInterest: true,
          poiCategories: [POICategory.RESTAURANT]
        }
      };

      // First request should hit Claude API
      const firstResponse = await server.generateRoute(request);
      
      // Second request should hit cache
      const secondResponse = await server.generateRoute(request);
      
      expect(firstResponse).toEqual(secondResponse);
      const metrics = server.getMetrics();
      expect(metrics.cacheHits).toBe(1);
    });
  });

  describe('Tool Registration', () => {
    it('should have required tools available', async () => {
      const tools = server.getAvailableTools();
      expect(tools.map(t => t.name)).toContain('generate_route');
      expect(tools.map(t => t.name)).toContain('search_poi');
    });
  });

  describe('River/Tributaries Model', () => {
    it('should generate a main route with tributaries', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'CAR',
          includePointsOfInterest: true,
          poiCategories: [POICategory.RESTAURANT],
          tributaries: [
            {
              activityType: 'HIKE',
              maxDistance: 5000,
              preferScenic: true
            },
            {
              activityType: 'BIKE',
              maxDistance: 10000,
              avoidHills: true
            }
          ]
        }
      };

      const response = await server.generateRoute(request);
      
      // Verify main route
      expect(response.route).toBeDefined();
      expect(response.route[0].segmentType).toBe('MAIN');
      expect(response.route[0].activityType).toBe('CAR');

      // Verify tributaries
      const tributaries = response.route.filter(segment => segment.segmentType === 'TRIBUTARY');
      expect(tributaries.length).toBeGreaterThan(0);
      
      // Verify hiking tributary
      const hikingTributary = tributaries.find(t => t.activityType === 'HIKE');
      expect(hikingTributary).toBeDefined();
      expect(hikingTributary?.distance).toBeLessThanOrEqual(5000);
      
      // Verify biking tributary
      const bikingTributary = tributaries.find(t => t.activityType === 'BIKE');
      expect(bikingTributary).toBeDefined();
      expect(bikingTributary?.distance).toBeLessThanOrEqual(10000);
    });

    it('should handle connection points between main route and tributaries', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'CAR',
          tributaries: [
            {
              activityType: 'SKI',
              maxDistance: 15000,
              winterPreferences: {
                difficulty: 'intermediate',
                requireSnowmaking: true
              }
            }
          ]
        }
      };

      const response = await server.generateRoute(request);
      
      // Verify main route
      expect(response.route).toBeDefined();
      const mainRoute = response.route.find(s => s.segmentType === 'MAIN');
      expect(mainRoute).toBeDefined();

      // Verify ski tributary
      const skiTributary = response.route.find(s => s.activityType === 'SKI');
      expect(skiTributary).toBeDefined();
      
      // Verify connection points
      expect(skiTributary?.points[0]).toEqual(expect.objectContaining({
        lat: expect.any(Number),
        lng: expect.any(Number)
      }));
      
      // Verify the connection point is on the main route
      const connectionPoint = skiTributary?.points[0];
      const isConnected = mainRoute?.points.some(point => 
        point.lat === connectionPoint?.lat && point.lng === connectionPoint?.lng
      );
      expect(isConnected).toBe(true);
    });

    it('should optimize multi-activity routes', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'CAR',
          optimizeFor: 'MULTI_ACTIVITY',
          tributaries: [
            { activityType: 'PHOTO', maxDuration: 3600 },
            { activityType: 'FOOD', maxDuration: 7200 },
            { activityType: 'SHOPPING', maxDuration: 5400 }
          ]
        }
      };

      const response = await server.generateRoute(request);
      
      // Verify activity sequence optimization
      const tributaries = response.route.filter(s => s.segmentType === 'TRIBUTARY');
      expect(tributaries.length).toBe(3);
      
      // Verify timing constraints
      tributaries.forEach(tributary => {
        expect(tributary.duration).toBeDefined();
        if (tributary.activityType === 'PHOTO') {
          expect(tributary.duration).toBeLessThanOrEqual(3600);
        } else if (tributary.activityType === 'FOOD') {
          expect(tributary.duration).toBeLessThanOrEqual(7200);
        } else if (tributary.activityType === 'SHOPPING') {
          expect(tributary.duration).toBeLessThanOrEqual(5400);
        }
      });

      // Verify POI integration
      expect(response.suggestedPOIs).toBeDefined();
      expect(response.suggestedPOIs?.length).toBeGreaterThan(0);
      
      // Verify each tributary has relevant POIs
      const poiTypes = response.suggestedPOIs?.map(poi => poi.category);
      expect(poiTypes).toContain('PHOTO_SPOT');
      expect(poiTypes).toContain('RESTAURANT');
      expect(poiTypes).toContain('SHOPPING_CENTER');
    });
  });
}); 