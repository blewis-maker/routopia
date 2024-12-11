import { PineconeService } from '../PineconeService';
import { VectorSearchCache } from '../VectorSearchCache';
import { RouteRecommendationEngine } from '@/services/ai/RouteRecommendationEngine';
import { mockRoute, mockEmbedding } from '@/test/mocks/routes';

describe('Vector Search Integration', () => {
  let pineconeService: PineconeService;
  let searchCache: VectorSearchCache;
  let recommendationEngine: RouteRecommendationEngine;

  beforeAll(async () => {
    pineconeService = new PineconeService();
    searchCache = new VectorSearchCache();
    await pineconeService.initialize();
  });

  it('should find similar routes', async () => {
    const results = await pineconeService.searchSimilarRoutes(mockEmbedding, {
      activityType: 'hike',
      limit: 5
    });

    expect(results).toHaveLength(5);
    expect(results[0]).toHaveProperty('score');
    expect(results[0].score).toBeGreaterThan(0.5);
  });

  it('should cache search results', async () => {
    const options = { activityType: 'bike', limit: 3 };
    
    // First search
    const results1 = await pineconeService.searchSimilarRoutes(mockEmbedding, options);
    await searchCache.cacheResults(mockEmbedding, options, results1);

    // Second search should hit cache
    const cached = await searchCache.getCachedResults(mockEmbedding, options);
    expect(cached).toEqual(results1);
  });

  // Add more test cases...
}); 