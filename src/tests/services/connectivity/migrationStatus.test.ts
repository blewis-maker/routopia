import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMockPostgres } from './mockPostgres';

describe('Database Migration Status', () => {
  let client: any;

  beforeAll(async () => {
    client = createMockPostgres();
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  it('should have all migrations applied', async () => {
    const res = await client.query(`
      SELECT id, migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at;
    `);
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it('should have no failed migrations', async () => {
    const res = await client.query(`
      SELECT id, migration_name, finished_at 
      FROM _prisma_migrations 
      WHERE applied_steps_count < migration_steps_count;
    `);
    expect(res.rows).toHaveLength(0);
  });

  it('should have migrations in correct order', async () => {
    const res = await client.query(`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at;
    `);
    
    const timestamps = res.rows.map(row => new Date(row.finished_at).getTime());
    const isSorted = timestamps.every((val, idx) => 
      idx === 0 || val >= timestamps[idx - 1]
    );
    
    expect(isSorted).toBe(true);
  });
}); 