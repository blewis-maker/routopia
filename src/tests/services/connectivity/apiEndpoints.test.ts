import { beforeAll, afterAll, describe, it, expect } from 'vitest';

class MockAPIClient {
  private endpoints: Map<string, any> = new Map([
    ['/api/routes', []],
    ['/api/users', []],
    ['/api/metrics', { count: 0 }]
  ]);

  private mockLatency = 50; // ms

  async get(endpoint: string) {
    await this.simulateLatency();
    const data = this.endpoints.get(endpoint);
    if (!data) throw new Error(`Endpoint ${endpoint} not found`);
    return { status: 200, data };
  }

  async post(endpoint: string, data: any) {
    await this.simulateLatency();
    if (!this.endpoints.has(endpoint)) {
      throw new Error(`Endpoint ${endpoint} not found`);
    }
    return { status: 201, data };
  }

  async put(endpoint: string, data: any) {
    await this.simulateLatency();
    if (!this.endpoints.has(endpoint)) {
      throw new Error(`Endpoint ${endpoint} not found`);
    }
    return { status: 200, data };
  }

  async delete(endpoint: string) {
    await this.simulateLatency();
    if (!this.endpoints.has(endpoint)) {
      throw new Error(`Endpoint ${endpoint} not found`);
    }
    return { status: 204 };
  }

  private async simulateLatency() {
    await new Promise(resolve => setTimeout(resolve, this.mockLatency));
  }
}

describe('API Endpoints', () => {
  let apiClient: MockAPIClient;

  beforeAll(() => {
    apiClient = new MockAPIClient();
  });

  describe('Response Times', () => {
    it('should respond to GET requests within threshold', async () => {
      const start = performance.now();
      await apiClient.get('/api/routes');
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle POST requests efficiently', async () => {
      const start = performance.now();
      await apiClient.post('/api/routes', { name: 'Test Route' });
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent endpoints', async () => {
      await expect(
        apiClient.get('/api/nonexistent')
      ).rejects.toThrow('Endpoint /api/nonexistent not found');
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const endpoints = [
        '/api/routes',
        '/api/users',
        '/api/metrics'
      ];

      const start = performance.now();
      const results = await Promise.all(
        endpoints.map(endpoint => apiClient.get(endpoint))
      );
      const duration = performance.now() - start;

      expect(results).toHaveLength(3);
      expect(duration).toBeLessThan(150); // Should be faster than sequential
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });
}); 