import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import dotenv from 'dotenv';
import Redis from 'ioredis';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Redis
vi.mock('ioredis', () => {
  const Redis = vi.fn();
  Redis.prototype.get = vi.fn();
  Redis.prototype.set = vi.fn();
  Redis.prototype.del = vi.fn();
  Redis.prototype.quit = vi.fn();
  return Redis;
});

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn()
    }
  }))
}));

let redis: Redis;

beforeAll(() => {
  redis = new Redis();
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  await redis.quit();
}); 