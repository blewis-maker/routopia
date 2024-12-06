import { RouteRankingService } from '@/services/route/RouteRankingService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { Route, RoutePreferences } from '@/types/route/types';
import { GeoPoint } from '@/types/geo';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/traffic/TrafficService');
jest.mock('@/services/terrain/TerrainAnalysisService');

describe('RouteRankingService', () => {
  let service: RouteRankingService;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockTrafficService: jest.Mocked<TrafficService>;
  let mockTerrainService: jest.Mocked<TerrainAnalysisService>;

  const mockPoint: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
  
  const mockRoute1: Route = {
    id: 'route1',
    segments: [
      {
        startPoint: mockPoint,
        endPoint: { latitude: 40.7589, longitude: -73.9851 }
      }
    ]
  };

  const mockRoute2: Route = {
    id: 'route2',
    segments: [
      {
        startPoint: mockPoint,
        endPoint: { latitude: 40.7829, longitude: -73.9654 }
      }
    ]
  };

  beforeEach(() => {
    mockWeatherService = {
      getWeatherForLocation: jest.fn()
    } as any;

    mockTrafficService = {
      getCurrentConditions: jest.fn()
    } as any;

    mockTerrainService = {
      getCurrentConditions: jest.fn()
    } as any;

    service = new RouteRankingService(
      mockWeatherService,
      mockTrafficService,
      mockTerrainService
    );
  });

  describe('rankRoutes', () => {
    it('should rank routes based on weather conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValueOnce({
        conditions: ['clear'],
        temperature: 20,
        humidity: 50,
        windSpeed: 5,
        precipitation: 0,
        visibility: 10,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 10
      });

      mockWeatherService.getWeatherForLocation.mockResolvedValueOnce({
        conditions: ['rain'],
        temperature: 15,
        humidity: 80,
        windSpeed: 15,
        precipitation: 5,
        visibility: 5,
        pressure: 1010,
        uvIndex: 2,
        cloudCover: 90
      });

      mockTrafficService.getCurrentConditions.mockResolvedValue({
        congestionLevel: 0.2
      });

      mockTerrainService.getCurrentConditions.mockResolvedValue({
        hazards: [],
        slope: 5
      });

      const preferences: RoutePreferences = {
        activityType: 'WALK',
        avoidTraffic: true,
        preferScenic: false,
        avoidTolls: false
      };

      const result = await service.rankRoutes([mockRoute1, mockRoute2], preferences);

      expect(result.rankedRoutes[0].id).toBe('route1');
      expect(result.rankedRoutes[1].id).toBe('route2');
      expect(result.scores.get('route1')).toBeGreaterThan(result.scores.get('route2')!);
    });

    it('should rank routes based on traffic conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        conditions: ['clear'],
        temperature: 20,
        humidity: 50,
        windSpeed: 5,
        precipitation: 0,
        visibility: 10,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 10
      });

      mockTrafficService.getCurrentConditions.mockResolvedValueOnce({
        congestionLevel: 0.2
      });

      mockTrafficService.getCurrentConditions.mockResolvedValueOnce({
        congestionLevel: 0.8
      });

      mockTerrainService.getCurrentConditions.mockResolvedValue({
        hazards: [],
        slope: 5
      });

      const preferences: RoutePreferences = {
        activityType: 'WALK',
        avoidTraffic: true,
        preferScenic: false,
        avoidTolls: false
      };

      const result = await service.rankRoutes([mockRoute1, mockRoute2], preferences);

      expect(result.rankedRoutes[0].id).toBe('route1');
      expect(result.rankedRoutes[1].id).toBe('route2');
      expect(result.scores.get('route1')).toBeGreaterThan(result.scores.get('route2')!);
    });

    it('should rank routes based on terrain conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        conditions: ['clear'],
        temperature: 20,
        humidity: 50,
        windSpeed: 5,
        precipitation: 0,
        visibility: 10,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 10
      });

      mockTrafficService.getCurrentConditions.mockResolvedValue({
        congestionLevel: 0.2
      });

      mockTerrainService.getCurrentConditions.mockResolvedValueOnce({
        hazards: [],
        slope: 5
      });

      mockTerrainService.getCurrentConditions.mockResolvedValueOnce({
        hazards: ['construction'],
        slope: 15
      });

      const preferences: RoutePreferences = {
        activityType: 'WALK',
        avoidTraffic: false,
        preferScenic: true,
        avoidTolls: false
      };

      const result = await service.rankRoutes([mockRoute1, mockRoute2], preferences);

      expect(result.rankedRoutes[0].id).toBe('route1');
      expect(result.rankedRoutes[1].id).toBe('route2');
      expect(result.scores.get('route1')).toBeGreaterThan(result.scores.get('route2')!);
    });

    it('should consider user preferences in ranking', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        conditions: ['clear'],
        temperature: 20,
        humidity: 50,
        windSpeed: 5,
        precipitation: 0,
        visibility: 10,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 10
      });

      mockTrafficService.getCurrentConditions.mockResolvedValue({
        congestionLevel: 0.5
      });

      mockTerrainService.getCurrentConditions.mockResolvedValue({
        hazards: [],
        slope: 5
      });

      const preferences1: RoutePreferences = {
        activityType: 'WALK',
        avoidTraffic: true,
        preferScenic: false,
        avoidTolls: false
      };

      const preferences2: RoutePreferences = {
        activityType: 'WALK',
        avoidTraffic: false,
        preferScenic: true,
        avoidTolls: true
      };

      const result1 = await service.rankRoutes([mockRoute1, mockRoute2], preferences1);
      const result2 = await service.rankRoutes([mockRoute1, mockRoute2], preferences2);

      expect(result1.scores).not.toEqual(result2.scores);
    });
  });
}); 