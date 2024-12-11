import { Redis } from 'ioredis';
import { SearchOptions } from '@/types/search/vector';
import { CombinedRoute } from '@/types/combinedRoute';

export class VectorSearchCache {
  private redis: Redis;
  private readonly TTL = 3600; // 1 hour

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async getCachedResults(
    embedding: number[],
    options: SearchOptions
  ): Promise<CombinedRoute[] | null> {
    const cacheKey = this.generateCacheKey(embedding, options);
    const cached = await this.redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  async cacheResults(
    embedding: number[],
    options: SearchOptions,
    results: CombinedRoute[]
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(embedding, options);
    await this.redis.setex(cacheKey, this.TTL, JSON.stringify(results));
  }

  private generateCacheKey(embedding: number[], options: SearchOptions): string {
    const hash = this.hashEmbedding(embedding);
    return `vector:${hash}:${JSON.stringify(options)}`;
  }

  private hashEmbedding(embedding: number[]): string {
    // Implement a fast hashing function for the embedding
    return embedding.slice(0, 5).join('-');
  }
} 