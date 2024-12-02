import { vi } from 'vitest';

export class MockRedis {
  private store: Map<string, { value: string, expiry?: number }> = new Map();

  async ping() {
    return 'PONG';
  }

  async set(key: string, value: string, ...args: string[]) {
    let expiry: number | undefined;
    
    // Handle expiration
    if (args.includes('EX')) {
      const exIndex = args.indexOf('EX');
      const seconds = parseInt(args[exIndex + 1]);
      expiry = Date.now() + (seconds * 1000);
    }
    
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async get(key: string) {
    const data = this.store.get(key);
    if (!data) return null;
    
    // Check expiration
    if (data.expiry && Date.now() > data.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return data.value;
  }

  async quit() {
    this.store.clear();
    return 'OK';
  }
}

export const createMockRedis = () => {
  return new MockRedis();
}; 