import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createMockRedis } from './mockRedis';

describe('Redis Cache Operations', () => {
  let redis: any;

  beforeAll(() => {
    redis = createMockRedis();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('should handle complex data structures', async () => {
    const testObject = {
      id: 1,
      name: 'Test Route',
      coordinates: [[51.5074, -0.1278], [48.8566, 2.3522]]
    };
    
    await redis.set('route:1', JSON.stringify(testObject));
    const retrieved = JSON.parse(await redis.get('route:1'));
    expect(retrieved).toEqual(testObject);
  });

  it('should handle cache expiration', async () => {
    await redis.set('temp-key', 'temp-value', 'EX', 1);
    let value = await redis.get('temp-key');
    expect(value).toBe('temp-value');

    await new Promise(resolve => setTimeout(resolve, 1100));
    value = await redis.get('temp-key');
    expect(value).toBeNull();
  });

  it('should handle concurrent operations', async () => {
    const operations = Array(5).fill(null).map((_, index) => 
      redis.set(`key${index}`, `value${index}`)
    );
    
    await Promise.all(operations);
    
    const results = await Promise.all(
      Array(5).fill(null).map((_, index) => 
        redis.get(`key${index}`)
      )
    );
    
    results.forEach((value, index) => {
      expect(value).toBe(`value${index}`);
    });
  });
}); 