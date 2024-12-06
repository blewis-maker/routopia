import { LearningSystem } from '@/services/ai/LearningSystem';
import {
  MockCrossActivityLearningService,
  MockContextualLearningService,
  MockSocialLearningService,
  createMockPatterns
} from '../../mocks/services/ai/MockLearningServices';
import { ActivityType } from '@/types/activity';
import { GeoPoint } from '@/types/geo';
import { WeatherConditions } from '@/types/weather';
import { TerrainConditions } from '@/types/route/types';
import { SocialFactors } from '@/types/social';

describe('LearningSystem Integration', () => {
  let learningSystem: LearningSystem;
  let mockCrossActivityService: MockCrossActivityLearningService;
  let mockContextualService: MockContextualLearningService;
  let mockSocialService: MockSocialLearningService;

  const mockUserId = 'test-user-123';
  const mockLocation: GeoPoint = { lat: 40.7128, lng: -74.0060 };

  const mockActivity = {
    type: 'WALK' as ActivityType,
    metrics: {
      duration: 1800,
      distance: 5000,
      speed: 10,
      elevation: {
        gain: 50,
        loss: 30,
        current: 100
      },
      pace: 6,
      calories: 350
    },
    location: mockLocation
  };

  const mockWeather: WeatherConditions = {
    temperature: 20,
    conditions: 'clear',
    windSpeed: 5,
    precipitation: 0,
    humidity: 60,
    visibility: 10000,
    pressure: 1013,
    uvIndex: 5,
    cloudCover: 10
  };

  const mockTerrain: TerrainConditions = {
    elevation: 100,
    surface: 'paved',
    difficulty: 'moderate',
    features: ['flat', 'urban']
  };

  const mockSocial: SocialFactors = {
    popularTimes: [{ hour: 14, crowdLevel: 5 }],
    userRatings: {
      safety: 4.5,
      scenery: 4.0,
      difficulty: 3.5,
      facilities: 4.0
    },
    recentActivity: {
      lastHour: 10,
      lastDay: 100
    }
  };

  beforeEach(() => {
    mockCrossActivityService = new MockCrossActivityLearningService();
    mockContextualService = new MockContextualLearningService();
    mockSocialService = new MockSocialLearningService();

    const mockPatterns = createMockPatterns();
    mockCrossActivityService.setMockPatterns(mockPatterns.crossActivityPatterns);
    mockContextualService.setMockPatterns(mockPatterns.contextualPatterns);
    mockSocialService.setMockPatterns(mockPatterns.socialPatterns);

    learningSystem = new LearningSystem(
      mockCrossActivityService,
      mockContextualService,
      mockSocialService
    );
  });

  describe('Edge Cases', () => {
    it('should handle missing metrics gracefully', async () => {
      const incompleteActivity = {
        type: 'WALK' as ActivityType,
        metrics: {
          duration: 1800,
          distance: 5000,
          speed: 10
        },
        location: mockLocation
      };

      const result = await learningSystem.processActivityLearning(
        mockUserId,
        incompleteActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      expect(result.patterns).toBeDefined();
      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it('should handle extreme weather conditions', async () => {
      const extremeWeather: WeatherConditions = {
        ...mockWeather,
        temperature: -20,
        windSpeed: 100,
        precipitation: 50,
        visibility: 100
      };

      // Update mock patterns for extreme weather
      const { contextualPatterns } = createMockPatterns();
      contextualPatterns.environmentalPatterns[0].confidence = 0.3;
      mockContextualService.setMockPatterns(contextualPatterns);

      const result = await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: extremeWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      const weatherPatterns = result.patterns.filter(p => p.type === 'weather');
      expect(weatherPatterns.length).toBeGreaterThan(0);
      expect(weatherPatterns[0].confidence).toBeLessThan(0.5);
    });

    it('should handle concurrent activities', async () => {
      const activities = Array(5).fill(mockActivity).map((activity, i) => ({
        ...activity,
        metrics: {
          ...activity.metrics,
          duration: 1800 + i * 100,
          distance: 5000 + i * 500,
          speed: 10 + i
        }
      }));

      const results = await Promise.all(
        activities.map(activity =>
          learningSystem.processActivityLearning(
            mockUserId,
            activity,
            {
              weather: mockWeather,
              terrain: mockTerrain,
              social: mockSocial
            }
          )
        )
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.patterns).toBeDefined();
        expect(result.recommendations).toBeDefined();
      });
    });

    it('should handle invalid social data', async () => {
      const invalidSocial: SocialFactors = {
        popularTimes: [],
        userRatings: {
          safety: 0,
          scenery: 0,
          difficulty: 0,
          facilities: 0
        },
        recentActivity: {
          lastHour: 0,
          lastDay: 0
        }
      };

      const result = await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: invalidSocial
        }
      );

      const socialPatterns = result.patterns.filter(p => p.type === 'social');
      expect(socialPatterns.length).toBeGreaterThan(0);
      expect(socialPatterns[0].confidence).toBeLessThan(0.3);
    });

    it('should handle rapid activity transitions', async () => {
      const activities = [
        { ...mockActivity, type: 'WALK' as ActivityType },
        { ...mockActivity, type: 'RUN' as ActivityType },
        { ...mockActivity, type: 'BIKE' as ActivityType },
        { ...mockActivity, type: 'WALK' as ActivityType }
      ];

      const results = [];
      for (const activity of activities) {
        const result = await learningSystem.processActivityLearning(
          mockUserId,
          activity,
          {
            weather: mockWeather,
            terrain: mockTerrain,
            social: mockSocial
          }
        );
        results.push(result);
      }

      expect(results).toHaveLength(4);
      const crossActivityPatterns = results.flatMap(r =>
        r.patterns.filter(p => p.type === 'cross_activity')
      );
      expect(crossActivityPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Component Learning', () => {
    it('should process activity learning across all components', async () => {
      const result = await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      expect(result.patterns).toBeDefined();
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.recommendations).toBeDefined();
      expect(result.adaptations).toHaveProperty('crossActivity');
      expect(result.adaptations).toHaveProperty('contextual');
      expect(result.adaptations).toHaveProperty('social');
    });

    it('should generate consistent patterns across components', async () => {
      const result = await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      // Check pattern consistency
      const performancePatterns = result.patterns.filter(p => p.type === 'performance');
      const weatherPatterns = result.patterns.filter(p => p.type === 'weather');
      const socialPatterns = result.patterns.filter(p => p.type === 'social');

      expect(performancePatterns.length).toBeGreaterThan(0);
      expect(weatherPatterns.length).toBeGreaterThan(0);
      expect(socialPatterns.length).toBeGreaterThan(0);

      // Verify pattern relationships
      performancePatterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.pattern).toHaveProperty('intensity');
      });

      weatherPatterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.pattern).toHaveProperty('temperature');
      });

      socialPatterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThan(0);
        expect(pattern.pattern).toHaveProperty('crowdLevel');
      });
    });

    it('should adapt recommendations based on historical patterns', async () => {
      // First activity
      await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      // Second activity with different conditions
      const result = await learningSystem.processActivityLearning(
        mockUserId,
        {
          ...mockActivity,
          metrics: {
            ...mockActivity.metrics,
            duration: 2400, // Longer duration
            distance: 7000 // Greater distance
          }
        },
        {
          weather: {
            ...mockWeather,
            temperature: 25 // Warmer temperature
          },
          terrain: mockTerrain,
          social: {
            ...mockSocial,
            popularTimes: [{ hour: 14, crowdLevel: 8 }] // More crowded
          }
        }
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.adaptations).toBeDefined();
      
      // Verify adaptations reflect historical patterns
      const { crossActivity, contextual, social } = result.adaptations;
      expect(crossActivity).toBeDefined();
      expect(contextual).toBeDefined();
      expect(social).toBeDefined();
    });

    it('should handle multiple activity types', async () => {
      // Walking activity
      const walkResult = await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      // Biking activity
      const bikeResult = await learningSystem.processActivityLearning(
        mockUserId,
        {
          ...mockActivity,
          type: 'BIKE' as ActivityType,
          metrics: {
            ...mockActivity.metrics,
            averageSpeed: 20,
            distance: 15000
          }
        },
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );

      expect(walkResult.patterns.some(p => p.type === 'cross_activity')).toBe(true);
      expect(bikeResult.patterns.some(p => p.type === 'cross_activity')).toBe(true);
    });
  });

  describe('Pattern Evolution', () => {
    it('should evolve patterns over multiple activities', async () => {
      const activities = [];
      const results = [];

      // Simulate multiple activities over time
      for (let i = 0; i < 5; i++) {
        const result = await learningSystem.processActivityLearning(
          mockUserId,
          {
            ...mockActivity,
            metrics: {
              ...mockActivity.metrics,
              duration: 1800 + i * 300, // Increasing duration
              distance: 5000 + i * 1000 // Increasing distance
            }
          },
          {
            weather: mockWeather,
            terrain: mockTerrain,
            social: mockSocial
          }
        );
        results.push(result);
      }

      // Verify pattern evolution
      for (let i = 1; i < results.length; i++) {
        const prevPatterns = results[i - 1].patterns;
        const currentPatterns = results[i].patterns;

        // Check pattern confidence evolution
        currentPatterns.forEach(pattern => {
          const prevPattern = prevPatterns.find(p => p.type === pattern.type);
          if (prevPattern) {
            expect(pattern.confidence).toBeGreaterThanOrEqual(prevPattern.confidence);
          }
        });
      }
    });
  });

  describe('Performance Benchmarks', () => {
    it('should process activities within acceptable time limits', async () => {
      const startTime = Date.now();
      await learningSystem.processActivityLearning(
        mockUserId,
        mockActivity,
        {
          weather: mockWeather,
          terrain: mockTerrain,
          social: mockSocial
        }
      );
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should be much faster with mocks
    });

    it('should handle batch processing efficiently', async () => {
      const batchSize = 100; // Can test with larger batches due to mocks
      const activities = Array(batchSize).fill(mockActivity);
      
      const startTime = Date.now();
      await Promise.all(
        activities.map(activity =>
          learningSystem.processActivityLearning(
            mockUserId,
            activity,
            {
              weather: mockWeather,
              terrain: mockTerrain,
              social: mockSocial
            }
          )
        )
      );
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should be much faster with mocks
      expect(duration / batchSize).toBeLessThan(10); // Average time per activity
    });

    it('should maintain performance with complex patterns', async () => {
      const complexActivity = {
        ...mockActivity,
        metrics: {
          ...mockActivity.metrics,
          speed: 15,
          elevation: {
            gain: 500,
            loss: 300,
            current: 1000
          }
        }
      };

      const startTime = Date.now();
      const result = await learningSystem.processActivityLearning(
        mockUserId,
        complexActivity,
        {
          weather: {
            ...mockWeather,
            conditions: 'storm',
            windSpeed: 30
          },
          terrain: {
            ...mockTerrain,
            difficulty: 'expert'
          },
          social: {
            ...mockSocial,
            popularTimes: Array(24).fill({ hour: 0, crowdLevel: 5 })
          }
        }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1500); // Should complete within 1.5 seconds
      expect(result.patterns.length).toBeGreaterThan(5);
    });
  });
}); 