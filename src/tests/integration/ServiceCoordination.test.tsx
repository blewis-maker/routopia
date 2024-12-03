import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { createMockPostgres } from '../services/connectivity/mockPostgres';
import { createMockRedis } from '../services/connectivity/mockRedis';
import { createMockS3 } from '../services/connectivity/mockS3';
import { MockAuthService } from '../services/connectivity/authFlow.test';
import { PerformanceMonitor } from '@/services/monitoring/PerformanceMonitor';

describe('Service Coordination Tests', () => {
  let postgres: any;
  let redis: any;
  let s3Client: any;
  let authService: MockAuthService;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(async () => {
    postgres = createMockPostgres();
    redis = createMockRedis();
    s3Client = createMockS3();
    authService = new MockAuthService();
    performanceMonitor = new PerformanceMonitor();

    await postgres.connect();
  });

  afterEach(async () => {
    await postgres.end();
    await redis.quit();
  });

  describe('Cross-Service Data Flow', () => {
    test('should handle route creation across services', async () => {
      const startTime = performance.now();
      
      // 1. Authenticate
      const token = await authService.login('test@example.com', 'password123');
      expect(await authService.validateToken(token)).toBe(true);

      // 2. Store route in Postgres
      const routeData = {
        id: 'route-123',
        userId: 'user-1',
        waypoints: [[0, 0], [1, 1]]
      };
      await postgres.query('INSERT INTO routes...');

      // 3. Cache in Redis
      await redis.set(`route:${routeData.id}`, JSON.stringify(routeData), 'EX', 3600);

      // 4. Store media in S3
      const mediaData = Buffer.from('route-preview.jpg');
      await s3Client.putObject({
        Bucket: 'routes',
        Key: `${routeData.id}/preview.jpg`,
        Body: mediaData
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Verify data consistency
      const cachedRoute = JSON.parse(await redis.get(`route:${routeData.id}`));
      expect(cachedRoute).toEqual(routeData);

      const s3Object = await s3Client.getObject({
        Bucket: 'routes',
        Key: `${routeData.id}/preview.jpg`
      });
      expect(s3Object.Body).toEqual(mediaData);

      // Performance assertions
      expect(duration).toBeLessThan(1000); // Complete flow under 1s
    });

    test('should handle service failures gracefully', async () => {
      // Simulate Redis failure
      const originalSet = redis.set;
      redis.set = vi.fn().mockRejectedValue(new Error('Redis connection lost'));

      try {
        // Attempt operation with Redis failure
        const routeData = { id: 'route-456', points: [[0, 0], [1, 1]] };
        
        // Should still work with Postgres
        await postgres.query('INSERT INTO routes...');
        
        // Should fall back to S3 for temporary storage
        await s3Client.putObject({
          Bucket: 'routes-backup',
          Key: 'route-456',
          Body: Buffer.from(JSON.stringify(routeData))
        });

      } finally {
        redis.set = originalSet;
      }
    });
  });

  describe('Performance Under Load', () => {
    test('should maintain performance with multiple concurrent operations', async () => {
      const operations = Array(10).fill(null).map(async (_, index) => {
        const routeId = `route-${index}`;
        
        // Parallel operations across services
        return Promise.all([
          postgres.query('SELECT NOW()'),
          redis.set(routeId, 'test-data'),
          s3Client.putObject({
            Bucket: 'test-bucket',
            Key: routeId,
            Body: Buffer.from('test')
          })
        ]);
      });

      const startTime = performance.now();
      await Promise.all(operations);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(2000); // All operations under 2s
    });

    test('should optimize read operations with caching', async () => {
      const routeId = 'popular-route';
      const routeData = { id: routeId, name: 'Popular Route' };

      // Prime the cache
      await redis.set(`route:${routeId}`, JSON.stringify(routeData));

      // Measure cached reads
      const cachedReads = Array(50).fill(null).map(() => 
        redis.get(`route:${routeId}`)
      );

      const startTime = performance.now();
      await Promise.all(cachedReads);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500); // 50 reads under 500ms
    });
  });
}); 