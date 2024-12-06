import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import { ActivityType } from '../../../../types/mcp.types';
import { ErrorCode } from '../../types';

describe('Rate Limiting', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({
      anthropicApiKey: 'test-key',
      metricsEnabled: true,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 10000
      }
    });
  });

  it('should handle request rate limiting', async () => {
    const request = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.7751, lng: -122.4196 },
      preferences: {
        activityType: ActivityType.WALK
      }
    };

    // Make multiple requests in quick succession
    const requests = Array(5).fill(request);
    const responses = await Promise.allSettled(
      requests.map(req => server.generateRoute(req))
    );

    const fulfilled = responses.filter(r => r.status === 'fulfilled');
    const rejected = responses.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBeGreaterThan(0);
    expect(rejected.length).toBeLessThan(5);

    // Check that rejections are due to rate limiting
    rejected.forEach(r => {
      if (r.status === 'rejected') {
        expect(r.reason.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      }
    });
  });

  it('should handle token rate limiting', async () => {
    const request = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.7751, lng: -122.4196 },
      preferences: {
        activityType: ActivityType.WALK,
        // Add complex preferences to increase token usage
        urbanPreferences: {
          safetyPriority: 'high',
          lightingRequired: true,
          maxWalkingDistance: 2000,
          preferIndoor: false,
          atmosphereType: 'lively'
        }
      }
    };

    // Make multiple requests with high token usage
    const requests = Array(3).fill(request);
    const responses = await Promise.allSettled(
      requests.map(req => server.generateRoute(req))
    );

    const rejected = responses.filter(r => r.status === 'rejected');
    expect(rejected.length).toBeGreaterThan(0);

    // Check that rejections are due to token rate limiting
    rejected.forEach(r => {
      if (r.status === 'rejected') {
        expect(r.reason.code).toBe(ErrorCode.TOKEN_LIMIT_EXCEEDED);
      }
    });
  });
}); 