import { config } from 'dotenv';
import { resolve } from 'path';
import { vi } from 'vitest';

// Load test environment variables
config({
  path: resolve(__dirname, './test.env')
});

// Mock Winston logger
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock metrics for testing
vi.mock('../../utils/metrics', () => ({
  recordMetric: vi.fn(),
  flushMetrics: vi.fn(),
  getMetrics: vi.fn().mockReturnValue({
    requestCount: 0,
    errorCount: 0,
    latencyMs: [],
    cacheHits: 0,
    cacheMisses: 0,
    tokenUsage: 0,
    routeGenerationCount: 0,
    poiSearchCount: 0,
    lastFlush: Date.now()
  })
}));

// Mock Claude API responses for specific test cases
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        id: 'msg_test',
        content: [{ text: 'Test response' }],
        model: 'claude-3-opus-20240229',
        role: 'assistant',
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 150 }
      })
    };
  }
})); 