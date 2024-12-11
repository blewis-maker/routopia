import { PerformanceMetrics } from '@/services/monitoring/PerformanceMetrics';

export class DevelopmentFallback {
  private static instance: DevelopmentFallback;
  private metrics: PerformanceMetrics;
  private storage = new Map<string, any>();

  private constructor() {
    this.metrics = new PerformanceMetrics();
  }

  static getInstance(): DevelopmentFallback {
    if (!DevelopmentFallback.instance) {
      DevelopmentFallback.instance = new DevelopmentFallback();
    }
    return DevelopmentFallback.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    try {
      const value = this.storage.get(key);
      this.metrics.record('fallback.get.success', performance.now() - startTime);
      return value || null;
    } catch (error) {
      this.metrics.record('fallback.get.error', performance.now() - startTime);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const startTime = performance.now();
    try {
      this.storage.set(key, value);
      if (ttl) {
        setTimeout(() => this.storage.delete(key), ttl * 1000);
      }
      this.metrics.record('fallback.set.success', performance.now() - startTime);
    } catch (error) {
      this.metrics.record('fallback.set.error', performance.now() - startTime);
    }
  }

  async search(query: string): Promise<any[]> {
    // Simple in-memory search
    const results = [];
    for (const [_, value] of this.storage) {
      if (JSON.stringify(value).includes(query)) {
        results.push(value);
      }
    }
    return results;
  }

  clear(): void {
    this.storage.clear();
  }

  getMetrics() {
    return {
      size: this.storage.size,
      ...this.metrics.getSummary()
    };
  }
}

export const developmentFallback = DevelopmentFallback.getInstance(); 