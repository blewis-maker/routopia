interface RequestConfig {
  batchSize: number;
  debounceTime: number;
  maxRetries: number;
  failoverStrategy: 'cache' | 'alternative' | 'degrade';
}

export class RequestOptimizer {
  private static instance: RequestOptimizer;
  private requestQueue: Map<string, Promise<any>>;
  private config: RequestConfig;

  private constructor() {
    this.requestQueue = new Map();
    this.config = {
      batchSize: 10,
      debounceTime: 300,
      maxRetries: 3,
      failoverStrategy: 'cache'
    };
  }

  static getInstance(): RequestOptimizer {
    if (!RequestOptimizer.instance) {
      RequestOptimizer.instance = new RequestOptimizer();
    }
    return RequestOptimizer.instance;
  }

  async optimizedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: Partial<RequestConfig>
  ): Promise<T> {
    const config = { ...this.config, ...options };
    
    // Check if request is already in progress
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key) as Promise<T>;
    }

    const request = this.executeRequest(key, requestFn, config);
    this.requestQueue.set(key, request);

    try {
      const result = await request;
      this.requestQueue.delete(key);
      return result;
    } catch (error) {
      this.requestQueue.delete(key);
      throw error;
    }
  }

  private async executeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    config: RequestConfig
  ): Promise<T> {
    let retries = 0;
    
    while (retries < config.maxRetries) {
      try {
        const result = await requestFn();
        return result;
      } catch (error) {
        retries++;
        if (retries === config.maxRetries) {
          return this.handleFailover(key, error, config);
        }
        await this.delay(Math.pow(2, retries) * 1000); // Exponential backoff
      }
    }

    throw new Error('Request failed after max retries');
  }

  private async handleFailover<T>(
    key: string,
    error: any,
    config: RequestConfig
  ): Promise<T> {
    const cache = ApiCache.getInstance();

    switch (config.failoverStrategy) {
      case 'cache':
        const cachedData = cache.get<T>(key);
        if (cachedData) return cachedData;
        break;
      case 'alternative':
        // Implement alternative data source logic
        break;
      case 'degrade':
        // Return degraded/minimal response
        return {} as T;
    }

    throw error;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 