import { DynamicRoutingService } from '@/services/route/DynamicRoutingService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { Route, RoutePreferences } from '@/types/route/types';
import { mockRoute, mockPreferences } from '../__mocks__/routeMocks';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/terrain/TerrainAnalysisService');
jest.mock('@/services/traffic/TrafficService');

describe('DynamicRoutingService', () => {
  let service: DynamicRoutingService;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockTerrainService: jest.Mocked<TerrainAnalysisService>;
  let mockTrafficService: jest.Mocked<TrafficService>;

  beforeEach(() => {
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockTerrainService = new TerrainAnalysisService() as jest.Mocked<TerrainAnalysisService>;
    mockTrafficService = new TrafficService() as jest.Mocked<TrafficService>;

    service = new DynamicRoutingService(
      mockWeatherService,
      mockTerrainService,
      mockTrafficService
    );
  });

  describe('calculateRerouteNecessity', () => {
    it('should recommend reroute when conditions exceed threshold', async () => {
      const currentPosition: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
      
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        temperature: 20,
        conditions: ['rain'],
        windSpeed: 15,
        precipitation: 5,
        humidity: 80,
        visibility: 5000,
        pressure: 1015,
        uvIndex: 2,
        cloudCover: 90
      });

      mockTerrainService.getTerrainConditions.mockResolvedValue({
        surface: 'wet',
        weather: ['rain'],
        temperature: 20,
        features: [],
        hazards: []
      });

      mockTrafficService.getCurrentConditions.mockResolvedValue({
        timestamp: new Date(),
        level: 0.8,
        speed: 20,
        density: 50,
        confidence: 0.9
      });

      const result = await service.calculateRerouteNecessity(
        mockRoute,
        currentPosition,
        { ...mockPreferences, sensitivity: 0.5 }
      );

      expect(result.shouldReroute).toBe(true);
      expect(result.severity).toBeGreaterThan(0.5);
      expect(result.reason).toBeDefined();
    });

    it('should not recommend reroute when conditions are good', async () => {
      const currentPosition: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
      
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        temperature: 20,
        conditions: ['clear'],
        windSpeed: 5,
        precipitation: 0,
        humidity: 60,
        visibility: 10000,
        pressure: 1015,
        uvIndex: 5,
        cloudCover: 10
      });

      mockTerrainService.getTerrainConditions.mockResolvedValue({
        surface: 'dry',
        weather: ['clear'],
        temperature: 20,
        features: [],
        hazards: []
      });

      mockTrafficService.getCurrentConditions.mockResolvedValue({
        timestamp: new Date(),
        level: 0.2,
        speed: 50,
        density: 20,
        confidence: 0.9
      });

      const result = await service.calculateRerouteNecessity(
        mockRoute,
        currentPosition,
        { ...mockPreferences, sensitivity: 0.5 }
      );

      expect(result.shouldReroute).toBe(false);
      expect(result.severity).toBeLessThan(0.5);
    });
  });

  describe('generateAlternativeRoutes', () => {
    it('should generate valid alternative routes', async () => {
      const currentPosition: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
      
      const alternatives = await service.generateAlternativeRoutes(
        mockRoute,
        currentPosition,
        mockPreferences
      );

      expect(Array.isArray(alternatives)).toBe(true);
      alternatives.forEach(route => {
        expect(route.id).toBeDefined();
        expect(route.segments.length).toBeGreaterThan(0);
        expect(route.metrics).toBeDefined();
      });
    });

    it('should maintain completed segments in alternatives', async () => {
      const currentPosition: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
      
      const alternatives = await service.generateAlternativeRoutes(
        mockRoute,
        currentPosition,
        mockPreferences
      );

      alternatives.forEach(route => {
        const firstSegment = route.segments[0];
        expect(firstSegment.start).toEqual(mockRoute.segments[0].start);
        expect(firstSegment.metrics).toBeDefined();
      });
    });
  });
}); 