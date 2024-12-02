import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { MockAPIClient } from '../connectivity/apiEndpoints.test';

class LoadTester {
  private client: MockAPIClient;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    peak95ResponseTime: number;
  };

  constructor() {
    this.client = new MockAPIClient();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      peak95ResponseTime: 0
    };
  }

  async simulateUserSession() {
    const responseTimes: number[] = [];
    try {
      // Simulate typical user flow
      const start = performance.now();
      
      await this.client.get('/api/routes');
      await this.client.post('/api/metrics', { event: 'pageView' });
      await this.client.get('/api/users');
      
      const duration = performance.now() - start;
      responseTimes.push(duration);
      
      this.metrics.successfulRequests++;
    } catch (error) {
      this.metrics.failedRequests++;
    }
    this.metrics.totalRequests++;
    
    return responseTimes;
  }

  async runLoadTest(users: number, durationSeconds: number) {
    const sessions = Array(users).fill(null).map(() => {
      return this.simulateUserSession();
    });

    const startTime = Date.now();
    const allResponseTimes: number[] = [];

    while (Date.now() - startTime < durationSeconds * 1000) {
      const results = await Promise.all(sessions);
      results.forEach(times => allResponseTimes.push(...times));
    }

    // Calculate metrics
    this.metrics.averageResponseTime = 
      allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
    
    const sorted = allResponseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    this.metrics.peak95ResponseTime = sorted[p95Index];

    return this.metrics;
  }
}

describe('Load Testing', () => {
  let loadTester: LoadTester;

  beforeAll(() => {
    loadTester = new LoadTester();
  });

  it('should handle moderate load (10 concurrent users)', async () => {
    const metrics = await loadTester.runLoadTest(10, 5);
    
    expect(metrics.failedRequests).toBe(0);
    expect(metrics.averageResponseTime).toBeLessThan(200);
    expect(metrics.peak95ResponseTime).toBeLessThan(500);
  });

  it('should handle heavy load (50 concurrent users)', async () => {
    const metrics = await loadTester.runLoadTest(50, 5);
    
    expect(metrics.failedRequests).toBeLessThan(metrics.totalRequests * 0.01); // 1% error rate
    expect(metrics.averageResponseTime).toBeLessThan(500);
    expect(metrics.peak95ResponseTime).toBeLessThan(1000);
  });

  it('should maintain performance over time', async () => {
    const metrics = await loadTester.runLoadTest(25, 10);
    
    expect(metrics.failedRequests).toBe(0);
    expect(metrics.averageResponseTime).toBeLessThan(300);
  });
}); 