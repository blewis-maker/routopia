import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MCPServer } from '../../index';
import { RouteGenerationRequest, POICategory, TextBlock } from '../../types';
import Redis from 'ioredis';

describe('Route with POI Integration', () => {
  let server: MCPServer;
  let redis: Redis;

  beforeEach(async () => {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    server = new MCPServer({
      anthropicApiKey: process.env.CLAUDE_API_KEY || 'test-key',
      metricsEnabled: true
    });
  });

  afterEach(async () => {
    await redis.quit();
  });

  it('should generate route with POI suggestions', async () => {
    const routeRequest: RouteGenerationRequest = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'WALK' as const,
        includePointsOfInterest: true,
        poiCategories: [POICategory.RESTAURANT, POICategory.CAFE],
        constraints: {
          maxStops: 2,
          poiStopDuration: 1800
        }
      }
    };

    const response = await server.generateRoute(routeRequest);
    const textBlock = response.content[0] as TextBlock;
    expect(textBlock.type).toBe('text');
    expect(textBlock.text).toContain('restaurant');
    expect(textBlock.text).toContain('cafe');
  });

  it('should handle scheduled stops', async () => {
    const request: RouteGenerationRequest = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'WALK' as const,
        includePointsOfInterest: true,
        maxDuration: 7200,
        constraints: {
          maxStops: 2,
          poiStopDuration: 1800,
          departureTime: '2024-03-20T08:00:00Z'
        }
      }
    };

    const response = await server.generateRoute(request);
    const textBlock = response.content[0] as TextBlock;
    expect(textBlock.type).toBe('text');
    expect(textBlock.text).toContain('duration');
    expect(textBlock.text).toContain('stop');
  });

  // ... rest of the tests ...
}); 