import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { TransportationOptimizer } from '@/services/optimization/TransportationOptimizer';
import { SeasonalRouteOptimizer } from '@/services/optimization/SeasonalRouteOptimizer';
import { LearningSystem } from '@/services/ai/LearningSystem';
import { ActivityType } from '@/types/activity';
import { GeoPoint } from '@/types/geo';
import { UserPreferences } from '@/types/ai/learning';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/optimization/TransportationOptimizer');
jest.mock('@/services/optimization/SeasonalRouteOptimizer');
jest.mock('@/services/ai/LearningSystem');

describe('RealTimeOptimizer', () => {
  let optimizer: RealTimeOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockTransportationOptimizer: jest.Mocked<TransportationOptimizer>;
  let mockSeasonalOptimizer: jest.Mocked<SeasonalRouteOptimizer>;
  let mockLearningSystem: jest.Mocked<LearningSystem>;

  const mockStartPoint: GeoPoint = { lat: 40.7128, lng: -74.0060 };
  const mockEndPoint: GeoPoint = { lat: 40.7589, lng: -73.9851 };
  const mockUserId = 'test-user-id';
  const mockActivityType: ActivityType = 'WALK';
  const mockPreferences: UserPreferences = {
    preferredActivities: ['WALK', 'BIKE'],
    preferredTimes: {
      startHour: 8,
      endHour: 18,
      days: [1, 2, 3, 4, 5]
    },
    weatherPreferences: {
      temperatureRange: [15, 25],
      conditions: ['clear', 'partly_cloudy']
    },
    socialPreferences: {
      groupSize: 1,
      communityEngagement: false,
      privacySettings: {
        shareActivity: false,
        shareLocation: false,
        shareStats: false
      }
    }
  };

  beforeEach(() => {
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockTransportationOptimizer = new TransportationOptimizer() as jest.Mocked<TransportationOptimizer>;
    mockSeasonalOptimizer = new SeasonalRouteOptimizer() as jest.Mocked<SeasonalRouteOptimizer>;
    mockLearningSystem = new LearningSystem() as jest.Mocked<LearningSystem>;
    optimizer = new RealTimeOptimizer();
  });

  describe('optimizeRoute', () => {
    it('should successfully optimize a route with all conditions', async () => {
      const mockWeather = {
        temperature: 20,
        conditions: 'clear',
        windSpeed: 5,
        precipitation: 0,
        humidity: 50,
        visibility: 10000,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 0
      };

      const mockRoute = [
        {
          startPoint: mockStartPoint,
          endPoint: mockEndPoint,
          distance: 1000,
          duration: 900,
          type: mockActivityType
        }
      ];

      mockWeatherService.getWeatherForLocation.mockResolvedValue(mockWeather);
      mockTransportationOptimizer.optimizeMultiModal.mockResolvedValue(mockRoute);
      mockSeasonalOptimizer.optimizeForSeason.mockResolvedValue(mockRoute);

      const result = await optimizer.optimizeRoute(
        mockUserId,
        mockStartPoint,
        mockEndPoint,
        mockActivityType,
        mockPreferences
      );

      expect(result).toEqual(mockRoute);
      expect(mockWeatherService.getWeatherForLocation).toHaveBeenCalledWith(mockStartPoint);
      expect(mockTransportationOptimizer.optimizeMultiModal).toHaveBeenCalled();
      expect(mockSeasonalOptimizer.optimizeForSeason).toHaveBeenCalled();
    });

    it('should apply learning patterns when metrics are provided', async () => {
      const mockMetrics = {
        duration: 900,
        distance: 1000,
        elevation: {
          gain: 10,
          loss: 5,
          current: 100
        },
        pace: 5.5
      };

      mockLearningSystem.processActivityLearning.mockResolvedValue({
        patterns: [],
        recommendations: [],
        adaptations: {
          crossActivity: {},
          contextual: {},
          social: {}
        }
      });

      await optimizer.optimizeRoute(
        mockUserId,
        mockStartPoint,
        mockEndPoint,
        mockActivityType,
        mockPreferences,
        mockMetrics
      );

      expect(mockLearningSystem.processActivityLearning).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockWeatherService.getWeatherForLocation.mockRejectedValue(new Error('Weather service error'));

      await expect(
        optimizer.optimizeRoute(
          mockUserId,
          mockStartPoint,
          mockEndPoint,
          mockActivityType,
          mockPreferences
        )
      ).rejects.toThrow('Weather service error');
    });
  });

  describe('pattern application', () => {
    it('should apply performance patterns correctly', async () => {
      const mockPattern = {
        type: 'performance',
        confidence: 0.8,
        pattern: {
          intensity: 5,
          duration: 1800,
          elevation: {
            gain: 100,
            loss: 50
          },
          difficulty: 'moderate'
        }
      };

      // Test implementation
    });

    it('should apply weather patterns correctly', async () => {
      const mockPattern = {
        type: 'weather',
        confidence: 0.9,
        pattern: {
          temperature: {
            preferred: 20,
            range: [15, 25]
          },
          conditions: ['clear', 'partly_cloudy'],
          windSpeed: 10,
          precipitation: 0
        }
      };

      // Test implementation
    });

    it('should apply terrain patterns correctly', async () => {
      const mockPattern = {
        type: 'terrain_preference',
        confidence: 0.85,
        pattern: {
          surface: 'paved',
          elevation: {
            preferred: 100,
            range: [0, 200]
          },
          difficulty: 'moderate'
        }
      };

      // Test implementation
    });
  });
}); 