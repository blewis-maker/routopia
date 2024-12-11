import { OpenAIEmbeddings } from '../../OpenAIEmbeddings';
import { PineconeService } from '../../../search/PineconeService';
import { RouteRecommendationEngine } from '../../RouteRecommendationEngine';
import { mockRoute, mockEmbedding } from '@/test/mocks/routes';
import { WeatherService } from '@/services/weather/WeatherService';

describe('AI Services Integration', () => {
  let embeddings: OpenAIEmbeddings;
  let pineconeService: PineconeService;
  let recommendationEngine: RouteRecommendationEngine;

  beforeAll(async () => {
    embeddings = new OpenAIEmbeddings();
    pineconeService = new PineconeService();
    recommendationEngine = new RouteRecommendationEngine(embeddings, pineconeService);
  });

  describe('Route Recommendations', () => {
    it('should find similar routes based on activity type', async () => {
      const preferences = {
        activityType: 'trail',
        difficulty: 'moderate',
        distance: { min: 3000, max: 8000 }
      };

      const recommendations = await recommendationEngine.getRecommendations(preferences);
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].type).toBe('trail');
      expect(recommendations[0].metadata.difficulty).toBe('moderate');
    });

    it('should handle weather-aware recommendations', async () => {
      const preferences = {
        activityType: 'trail',
        weather: {
          conditions: 'rain',
          temperature: 15,
          windSpeed: 10
        }
      };

      const recommendations = await recommendationEngine.getRecommendations(preferences);
      expect(recommendations[0].metadata.conditions).toContain('rain-safe');
    });
  });

  describe('Route Recommendations with Context', () => {
    it('should consider user history', async () => {
      const userHistory = {
        recentRoutes: [mockRoute],
        preferences: {
          preferredDifficulty: 'moderate',
          preferredDistance: 5000
        }
      };

      const recommendations = await recommendationEngine.getRecommendationsWithHistory(
        { activityType: 'trail' },
        userHistory
      );

      expect(recommendations[0].metadata.difficulty).toBe(userHistory.preferences.preferredDifficulty);
    });

    it('should handle seasonal recommendations', async () => {
      const season = 'winter';
      const recommendations = await recommendationEngine.getRecommendations({
        activityType: 'ski',
        season,
        conditions: ['snow']
      });

      expect(recommendations[0].metadata.seasonal.best).toContain(season);
    });
  });

  describe('Multi-modal Route Planning', () => {
    it('should combine different activity types', async () => {
      const multiModalPreferences = {
        segments: [
          { type: 'drive', maxDistance: 10000 },
          { type: 'trail', difficulty: 'easy' }
        ]
      };

      const route = await recommendationEngine.getMultiModalRoute(multiModalPreferences);
      
      expect(route.segments).toHaveLength(2);
      expect(route.segments[0].type).toBe('drive');
      expect(route.segments[1].type).toBe('trail');
    });
  });

  describe('Performance and Caching', () => {
    it('should cache frequent searches', async () => {
      const commonQuery = {
        activityType: 'trail',
        difficulty: 'moderate'
      };

      // First call - should hit Pinecone
      const firstCall = await recommendationEngine.getRecommendations(commonQuery);
      
      // Second call - should hit cache
      const startTime = Date.now();
      const secondCall = await recommendationEngine.getRecommendations(commonQuery);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // Cache should be fast
      expect(secondCall).toEqual(firstCall);
    });
  });

  describe('Weather Integration', () => {
    let weatherService: WeatherService;

    beforeAll(() => {
      weatherService = new WeatherService();
    });

    it('should adapt recommendations based on weather', async () => {
      const weatherData = await weatherService.getForecast({
        lat: 40.7128,
        lng: -74.0060
      });

      const recommendations = await recommendationEngine.getRecommendations({
        activityType: 'trail',
        weather: weatherData
      });

      if (weatherData.precipitation > 0) {
        expect(recommendations[0].metadata.terrain.features).toContain('covered');
      }
    });
  });

  describe('Error Recovery', () => {
    it('should fallback to cached results on service failure', async () => {
      // Cache some results first
      const query = { activityType: 'trail' };
      const originalResults = await recommendationEngine.getRecommendations(query);

      // Simulate Pinecone service failure
      jest.spyOn(pineconeService, 'searchSimilarRoutes').mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const fallbackResults = await recommendationEngine.getRecommendations(query);
      expect(fallbackResults).toEqual(originalResults);
    });

    it('should handle partial service degradation', async () => {
      // Simulate slow response from vector search
      jest.spyOn(pineconeService, 'searchSimilarRoutes').mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 5000))
      );

      const results = await recommendationEngine.getRecommendations(
        { activityType: 'trail' },
        { timeout: 1000 }
      );

      // Should still get results, maybe less optimal
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Vector Search', () => {
    it('should index and retrieve routes', async () => {
      // Index a test route
      await pineconeService.indexRoute(mockRoute);

      // Search for similar routes
      const results = await pineconeService.searchSimilarRoutes(mockEmbedding, {
        activityType: mockRoute.type
      });

      expect(results[0].id).toBe(mockRoute.id);
      expect(results[0].score).toBeGreaterThan(0.8);
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limits', async () => {
      const promises = Array(10).fill(null).map(() => 
        embeddings.embedText('Test text')
      );

      await expect(Promise.all(promises)).resolves.not.toThrow();
    });

    it('should retry failed requests', async () => {
      // Simulate network failure
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const embedding = await embeddings.embedText('Test text');
      expect(embedding).toHaveLength(1536);
    });
  });
}); 
}); 