import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import Redis from 'ioredis';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set required environment variables for tests
process.env.CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'test-key';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.MCP_PORT = process.env.MCP_PORT || '3001';

// Mock Redis
vi.mock('ioredis', () => {
  const RedisMock = vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    quit: vi.fn()
  }));
  return { default: RedisMock };
});

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  class MockAPIError extends Error {
    status: number;
    type: string;
    raw: any;

    constructor(status: number, message: string, type: string, raw: any) {
      super(message);
      this.name = 'APIError';
      this.status = status;
      this.type = type;
      this.raw = raw;
    }
  }

  const mockCreate = vi.fn().mockImplementation(async () => ({
    id: 'msg_mock',
    model: 'claude-3-opus-20240229',
    role: 'assistant',
    content: [{
      type: 'text',
      text: 'Mocked Claude response'
    }]
  }));

  const AnthropicMock = vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate
    }
  }));

  // Add APIError to the default export and expose mockCreate for tests
  const Anthropic = Object.assign(AnthropicMock, {
    APIError: MockAPIError,
    mockCreate // Expose the mock for tests to use
  });

  return { default: Anthropic };
});

// Mock logger
vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
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