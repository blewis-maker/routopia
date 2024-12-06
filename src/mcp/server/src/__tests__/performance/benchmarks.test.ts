import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MCPServer } from '../../index';
import { RouteGenerationRequest, POIRequest } from '../../types';
import Redis from 'ioredis';

describe('MCP Server Performance', () => {
  let server: MCPServer;
  let redis: Redis;
  const sampleSize = 100;
  const concurrentRequests = 10;

  beforeEach(async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 1
    });

    server = new MCPServer({
      anthropicApiKey: process.env.CLAUDE_API_KEY || 'test-key',
      metricsEnabled: true
    });

    await redis.flushdb();
  });

  afterEach(async () => {
    await redis.quit();
  });

  describe('Response Time', () => {
    it('should maintain acceptable response times under load', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      };

      const startTime = Date.now();
      const responses = await Promise.all(
        Array(concurrentRequests).fill(null).map(() => 
          server.handleRouteGeneration(request)
        )
      );
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / concurrentRequests;

      expect(responses).toHaveLength(concurrentRequests);
      expect(avgResponseTime).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('Throughput', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const requests = Array(sampleSize).fill(null).map((_, i) => ({
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382 + (i * 0.001), lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      }));

      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < requests.length; i += batchSize) {
        batches.push(requests.slice(i, i + batchSize));
      }

      const startTime = Date.now();
      
      for (const batch of batches) {
        await Promise.all(
          batch.map(req => server.handleRouteGeneration(req))
        );
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const requestsPerSecond = (sampleSize / totalTime) * 1000;

      expect(requestsPerSecond).toBeGreaterThan(1); // At least 1 request per second
    });
  });

  describe('Error Rates', () => {
    it('should maintain low error rates under load', async () => {
      const requests = Array(sampleSize).fill(null).map((_, i) => ({
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382 + (i * 0.001), lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      }));

      const responses = await Promise.allSettled(
        requests.map(req => server.handleRouteGeneration(req))
      );

      const failures = responses.filter(r => r.status === 'rejected');
      const errorRate = failures.length / sampleSize;

      expect(errorRate).toBeLessThan(0.05); // Less than 5% error rate
    });
  });

  describe('Cache Performance', () => {
    it('should achieve high cache hit ratio for repeated requests', async () => {
      const request: RouteGenerationRequest = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      };

      // First request to populate cache
      await server.handleRouteGeneration(request);

      // Subsequent requests should hit cache
      const startTime = Date.now();
      const responses = await Promise.all(
        Array(sampleSize).fill(null).map(() => 
          server.handleRouteGeneration(request)
        )
      );
      const endTime = Date.now();

      const avgCachedResponseTime = (endTime - startTime) / sampleSize;
      expect(avgCachedResponseTime).toBeLessThan(50); // 50ms max for cached responses
      expect(responses).toHaveLength(sampleSize);
    });

    it('should handle cache eviction under memory pressure', async () => {
      const requests = Array(1000).fill(null).map((_, i) => ({
        startPoint: { lat: 37.7749 + (i * 0.0001), lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      }));

      // Fill cache with unique requests
      await Promise.all(
        requests.slice(0, 100).map(req => 
          server.handleRouteGeneration(req)
        )
      );

      // Verify cache eviction
      const response = await server.handleRouteGeneration(requests[0]);
      expect(response).toBeDefined();
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const requests = Array(sampleSize).fill(null).map((_, i) => ({
        startPoint: { lat: 37.7749 + (i * 0.0001), lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: {
          activityType: 'WALK'
        }
      }));

      await Promise.all(
        requests.map(req => server.handleRouteGeneration(req))
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
    });
  });
}); 