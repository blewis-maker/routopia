import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['src/__tests__/performance/**/*.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/performance/setup.ts'],
    testTimeout: 30000, // 30 seconds for performance tests
    maxConcurrency: 10,
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/__tests__/**'
      ]
    },
    reporters: [
      'default',
      'json',
      ['./src/__tests__/performance/reporters/performance.ts', {
        outputFile: './performance-results.json',
        metrics: [
          'responseTime',
          'throughput',
          'errorRate',
          'cacheHitRatio',
          'memoryUsage'
        ]
      }]
    ]
  }
}); 