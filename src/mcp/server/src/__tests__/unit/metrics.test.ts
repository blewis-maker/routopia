import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import logger from '../../utils/logger';

describe('MCP Server Metrics', () => {
  let server: MCPServer;
  
  beforeEach(() => {
    server = new MCPServer({
      metricsEnabled: true,
      metricsInterval: 1000
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Metrics Collection', () => {
    it('should record route generation metrics', async () => {
      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await server.handleRouteGeneration(request);
      
      // Advance timer to trigger metrics collection
      vi.advanceTimersByTime(1000);

      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server Metrics',
        expect.objectContaining({
          metrics: expect.objectContaining({
            requests_per_second: expect.any(Number),
            route_generations_per_second: expect.any(Number),
            average_latency_ms: expect.any(Number)
          })
        })
      );
    });

    it('should record POI search metrics', async () => {
      const request = {
        location: { lat: 37.7749, lng: -122.4194 },
        radius: 1000,
        categories: ['restaurant']
      };

      await server.handlePOISearch(request);
      
      vi.advanceTimersByTime(1000);

      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server Metrics',
        expect.objectContaining({
          metrics: expect.objectContaining({
            requests_per_second: expect.any(Number),
            poi_searches_per_second: expect.any(Number),
            average_latency_ms: expect.any(Number)
          })
        })
      );
    });

    it('should record error metrics', async () => {
      const invalidRequest = {
        startPoint: { lat: 37.7749 }, // Missing lng
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      try {
        await server.handleRouteGeneration(invalidRequest);
      } catch (error) {
        // Expected error
      }

      vi.advanceTimersByTime(1000);

      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server Metrics',
        expect.objectContaining({
          metrics: expect.objectContaining({
            errors_per_second: expect.any(Number)
          })
        })
      );
    });

    it('should calculate correct metrics rates', async () => {
      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      // Make multiple requests
      await Promise.all([
        server.handleRouteGeneration(request),
        server.handleRouteGeneration(request),
        server.handleRouteGeneration(request)
      ]);

      vi.advanceTimersByTime(1000);

      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server Metrics',
        expect.objectContaining({
          metrics: expect.objectContaining({
            requests_per_second: 3,
            route_generations_per_second: 3
          })
        })
      );
    });

    it('should reset metrics after collection interval', async () => {
      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      // First batch of requests
      await server.handleRouteGeneration(request);
      await server.handleRouteGeneration(request);
      
      vi.advanceTimersByTime(1000);

      // Second batch of requests
      await server.handleRouteGeneration(request);
      
      vi.advanceTimersByTime(1000);

      const calls = (logger.info as jest.Mock).mock.calls;
      const firstMetrics = calls[calls.length - 2][1].metrics;
      const secondMetrics = calls[calls.length - 1][1].metrics;

      expect(firstMetrics.requests_per_second).toBe(2);
      expect(secondMetrics.requests_per_second).toBe(1);
    });

    it('should track token usage', async () => {
      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      // Mock Claude response with token usage
      (server['claude'].messages.create as jest.Mock).mockResolvedValueOnce({
        content: [{ text: 'Success' }],
        usage: { total_tokens: 100 }
      });

      await server.handleRouteGeneration(request);
      
      vi.advanceTimersByTime(1000);

      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server Metrics',
        expect.objectContaining({
          metrics: expect.objectContaining({
            token_usage_per_second: 100
          })
        })
      );
    });
  });
}); 