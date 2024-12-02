import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import { createMockRedis } from './mockRedis';

describe('Redis Connection', () => {
  let redis: any;

  beforeAll(() => {
    redis = createMockRedis();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('should connect to Redis', async () => {
    const result = await redis.ping();
    expect(result).toBe('PONG');
  });

  it('should handle basic cache operations', async () => {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    expect(value).toBe('test-value');
  });
});
