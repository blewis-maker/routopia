import { RoutePredictionService } from '@/services/ai/RoutePredictionService';
import { LearningSystem } from '@/services/ai/LearningSystem';
import { CrossActivityLearningService } from '@/services/ai/CrossActivityLearningService';
import { ContextualLearningService } from '@/services/ai/ContextualLearningService';
import { WeatherConditions } from '@/types/weather/types';
import { TerrainAnalysisResult } from '@/types/terrain/types';
import { TrafficConditions } from '@/types/traffic/types';
import { Route, RoutePreferences } from '@/types/route/types';

jest.mock('@/services/ai/LearningSystem');
jest.mock('@/services/ai/CrossActivityLearningService');
jest.mock('@/services/ai/ContextualLearningService');

describe('RoutePredictionService', () => {
  let routePredictionService: RoutePredictionService;
  let mockLearningSystem: jest.Mocked<LearningSystem>;
  let mockCrossActivityLearning: jest.Mocked<CrossActivityLearningService>;
  let mockContextualLearning: jest.Mocked<ContextualLearningService>;

  const mockWeatherConditions: WeatherConditions = {
    temperature: 20,
    conditions: ['clear'],
    windSpeed: 5,
    visibility: 10000,
    precipitation: 0
  };

  const mockTerrainConditions: TerrainAnalysisResult = {
    surface: 'paved',
    elevation: 100,
    slope: 2,
    hazards: [],
    type: 'road',
    confidence: 0.95
  };

  const mockTrafficConditions: TrafficConditions = {
    level: 0.3,
    speed: 40,
    density: 0.2,
    timestamp: new Date(),
    confidence: 0.9
  };

  const mockPreferences: RoutePreferences = {
    activityType: 'WALK',
    avoidHighways: true,
    avoidTraffic: true,
    preferScenic: false,
    weights: {
      distance: 0.2,
      duration: 0.2,
      effort: 0.2,
      safety: 0.2,
      comfort: 0.2
    }
  };

  beforeEach(() => {
    mockLearningSystem = new LearningSystem() as jest.Mocked<LearningSystem>;
    mockCrossActivityLearning = new CrossActivityLearningService() as jest.Mocked<CrossActivityLearningService>;
    mockContextualLearning = new ContextualLearningService() as jest.Mocked<ContextualLearningService>;

    routePredictionService = new RoutePredictionService(
      mockLearningSystem,
      mockCrossActivityLearning,
      mockContextualLearning
    );

    // Setup mock responses
    mockLearningSystem.getPatterns.mockResolvedValue({
      patterns: [],
      confidence: 0.8
    });

    mockCrossActivityLearning.analyzePatterns.mockResolvedValue({
      insights: [],
      adaptations: []
    });

    mockContextualLearning.getAdaptations.mockResolvedValue({
      adaptations: [],
      confidence: 0.9
    });
  });

  describe('predictOptimalRoute', () => {
    it('should predict a route with confidence score and impact factors', async () => {
      const startPoint: [number, number] = [40.7128, -74.0060];
      const endPoint: [number, number] = [40.7589, -73.9851];

      const result = await routePredictionService.predictOptimalRoute(
        startPoint,
        endPoint,
        mockPreferences,
        {
          weather: mockWeatherConditions,
          terrain: mockTerrainConditions,
          traffic: mockTrafficConditions,
          timeOfDay: 14,
          dayOfWeek: 2,
          season: 'summer'
        }
      );

      expect(result).toBeDefined();
      expect(result.predictedRoute).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.alternativeRoutes).toBeDefined();
      expect(result.factors).toEqual(expect.objectContaining({
        weatherImpact: expect.any(Number),
        terrainImpact: expect.any(Number),
        trafficImpact: expect.any(Number),
        timeImpact: expect.any(Number),
        seasonalImpact: expect.any(Number),
        historicalImpact: expect.any(Number)
      }));
    });

    it('should handle errors from learning systems gracefully', async () => {
      mockLearningSystem.getPatterns.mockRejectedValue(new Error('Learning system error'));

      const startPoint: [number, number] = [40.7128, -74.0060];
      const endPoint: [number, number] = [40.7589, -73.9851];

      await expect(routePredictionService.predictOptimalRoute(
        startPoint,
        endPoint,
        mockPreferences,
        {
          weather: mockWeatherConditions,
          terrain: mockTerrainConditions,
          traffic: mockTrafficConditions,
          timeOfDay: 14,
          dayOfWeek: 2,
          season: 'summer'
        }
      )).rejects.toThrow('Failed to predict optimal route');
    });

    it('should integrate insights from all learning systems', async () => {
      const startPoint: [number, number] = [40.7128, -74.0060];
      const endPoint: [number, number] = [40.7589, -73.9851];

      await routePredictionService.predictOptimalRoute(
        startPoint,
        endPoint,
        mockPreferences,
        {
          weather: mockWeatherConditions,
          terrain: mockTerrainConditions,
          traffic: mockTrafficConditions,
          timeOfDay: 14,
          dayOfWeek: 2,
          season: 'summer'
        }
      );

      expect(mockLearningSystem.getPatterns).toHaveBeenCalled();
      expect(mockCrossActivityLearning.analyzePatterns).toHaveBeenCalled();
      expect(mockContextualLearning.getAdaptations).toHaveBeenCalled();
    });

    it('should consider user history when available', async () => {
      const startPoint: [number, number] = [40.7128, -74.0060];
      const endPoint: [number, number] = [40.7589, -73.9851];
      const mockHistory: Route[] = [{
        id: 'test-route-1',
        name: 'Test Route',
        segments: [],
        preferences: mockPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      const result = await routePredictionService.predictOptimalRoute(
        startPoint,
        endPoint,
        mockPreferences,
        {
          weather: mockWeatherConditions,
          terrain: mockTerrainConditions,
          traffic: mockTrafficConditions,
          timeOfDay: 14,
          dayOfWeek: 2,
          season: 'summer',
          userHistory: mockHistory
        }
      );

      expect(result.factors.historicalImpact).toBeGreaterThan(0);
    });
  });
}); 