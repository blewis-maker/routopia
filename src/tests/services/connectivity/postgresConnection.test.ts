// src/tests/services/postgresConnection.test.ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createMockPostgres } from './mockPostgres';

describe('PostgreSQL Connection', () => {
  let client: any;

  beforeAll(async () => {
    client = createMockPostgres();
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  it('should connect to PostgreSQL', async () => {
    const res = await client.query('SELECT NOW()');
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0]).toHaveProperty('now');
  });
});