export interface ServiceInterface {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  healthCheck(): Promise<boolean>;
}

export interface CacheableService extends ServiceInterface {
  getCacheKey(params: any): string;
  getCacheTTL(): number;
  clearCache(): Promise<void>;
}

export interface RateLimitedService extends ServiceInterface {
  getRateLimit(): number;
  getRateLimitWindow(): number;
  isRateLimited(): boolean;
} 