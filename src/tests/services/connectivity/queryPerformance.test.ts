import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMockPostgres } from './mockPostgres';

describe('Query Performance', () => {
  let client: any;

  beforeAll(async () => {
    client = createMockPostgres();
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  it('should execute queries within acceptable time', async () => {
    const startTime = performance.now();
    await client.query('SELECT NOW()');
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms threshold
  });

  it('should handle multiple concurrent queries', async () => {
    const queries = Array(5).fill(null).map(() => 
      client.query('SELECT NOW()')
    );
    
    const startTime = performance.now();
    await Promise.all(queries);
    const duration = performance.now() - startTime;
    
    expect(duration).toBeLessThan(500); // 500ms threshold for 5 queries
  });

  it('should maintain connection under load', async () => {
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      const res = await client.query('SELECT NOW()');
      expect(res.rows).toHaveLength(1);
    }
  });
}); 