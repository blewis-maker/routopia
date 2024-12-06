import { RouteRankingService } from '@/services/route/RouteRankingService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { mockPoint, mockPreferences, mockWeatherConditions, mockTerrainConditions, mockRoute, mockSegment } from '@/tests/__mocks__/routeMocks';
import { Route } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/terrain/TerrainAnalysisService');
jest.mock('@/services/traffic/TrafficService');

describe('RouteRankingService', () => {
  let rankingService: RouteRankingService;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockTerrainService: jest.Mocked<TerrainAnalysisService>;
  let mockTrafficService: jest.Mocked<TrafficService>;

  beforeEach(() => {
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockTerrainService = new TerrainAnalysisService() as jest.Mocked<TerrainAnalysisService>;
    mockTrafficService = new TrafficService() as jest.Mocked<TrafficService>;

    mockWeatherService.getCurrentConditions.mockResolvedValue(mockWeatherConditions);
    mockTerrainService.getTerrainConditions.mockResolvedValue(mockTerrainConditions);
    mockTrafficService.getCurrentConditions.mockResolvedValue({
      speed: 40,
      density: 0.3,
      timestamp: new Date(),
      confidence: 0.9
    });

    rankingService = new RouteRankingService(
      mockWeatherService,
      mockTerrainService,
      mockTrafficService
    );
  });

  describe('rankRoutes', () => {
    it('should rank routes based on preferences', async () => {
      const routes: Route[] = [
        mockRoute,
        {
          ...mockRoute,
          id: 'route-2',
          segments: [{
            ...mockSegment,
            id: 'segment-2',
            distance: 2000,
            duration: 1200
          }]
        }
      ];

      const result = await rankingService.rankRoutes(routes, mockPreferences);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should consider weather conditions in ranking', async () => {
      const routes: Route[] = [
        mockRoute,
        {
          ...mockRoute,
          id: 'route-2',
          segments: [{
            ...mockSegment,
            id: 'segment-2',
            metrics: {
              ...mockSegment.metrics,
              weatherImpact: 0.8
            }
          }]
        }
      ];

      const result = await rankingService.rankRoutes(routes, {
        ...mockPreferences,
        weights: {
          ...mockPreferences.weights,
          comfort: 0.8,
          safety: 0.8
        }
      });

      expect(result[0].id).toBe('route-1');
      expect(result[1].id).toBe('route-2');
    });

    it('should handle missing conditions gracefully', async () => {
      mockWeatherService.getCurrentConditions.mockRejectedValue(new Error('Service error'));

      const routes: Route[] = [mockRoute];
      const result = await rankingService.rankRoutes(routes, mockPreferences);

      expect(result).toBeDefined();
      expect(result[0].warnings).toContain('Weather data unavailable');
    });
  });
}); 