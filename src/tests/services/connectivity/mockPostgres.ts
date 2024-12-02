import { vi } from 'vitest';

export class MockPostgresClient {
  private connected: boolean = false;
  private mockMigrations = [
    {
      id: 1,
      migration_name: '20240101000000_init',
      finished_at: new Date('2024-01-01'),
      applied_steps_count: 1,
      migration_steps_count: 1
    },
    {
      id: 2,
      migration_name: '20240102000000_add_users',
      finished_at: new Date('2024-01-02'),
      applied_steps_count: 1,
      migration_steps_count: 1
    }
  ];

  async connect() {
    this.connected = true;
    return Promise.resolve();
  }

  async query(queryText: string) {
    if (!this.connected) {
      throw new Error('Client must be connected before querying');
    }
    
    if (queryText.includes('SELECT NOW()')) {
      return {
        rows: [{ now: new Date() }],
        rowCount: 1
      };
    }
    
    if (queryText.includes('_prisma_migrations')) {
      if (queryText.includes('applied_steps_count < migration_steps_count')) {
        return {
          rows: [],
          rowCount: 0
        };
      }
      return {
        rows: this.mockMigrations,
        rowCount: this.mockMigrations.length
      };
    }
    
    return {
      rows: [],
      rowCount: 0
    };
  }

  async end() {
    this.connected = false;
    return Promise.resolve();
  }
}

export const createMockPostgres = () => {
  return new MockPostgresClient();
}; 