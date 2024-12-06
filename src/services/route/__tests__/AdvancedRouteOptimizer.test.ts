import { AdvancedRouteOptimizer } from '../AdvancedRouteOptimizer';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainDifficulty } from '@/types/route/types';

// Mock dependencies
jest.mock('@/services/integration/MCPIntegrationService');
jest.mock('@/services/weather/WeatherService');

describe('AdvancedRouteOptimizer', () => {
  let advancedOptimizer: AdvancedRouteOptimizer;
  let mockMcpService: jest.Mocked<MCPIntegrationService>;
  let mockWeatherService: jest.Mocked<WeatherService>;

  beforeEach(() => {
    mockMcpService = new MCPIntegrationService() as jest.Mocked<MCPIntegrationService>;
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    advancedOptimizer = new AdvancedRouteOptimizer(mockMcpService, mockWeatherService);

    // Setup common mock responses
    mockMcpService.getBaseRoute.mockResolvedValue({
      path: [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 }
      ],
      distance: 1000,
      duration: 600
    });

    mockMcpService.getElevationProfile.mockResolvedValue({
      points: [
        { distance: 0, elevation: 100 },
        { distance: 500, elevation: 120 },
        { distance: 1000, elevation: 110 }
      ],
      maxGrade: 0.1
    });

    mockMcpService.getRoadConditions.mockResolvedValue({
      condition: 'good',
      surfaceType: 'paved',
      hazards: []
    });

    mockWeatherService.getForecast.mockResolvedValue({
      conditions: ['clear'],
      temperature: 20,
      windSpeed: 10,
      precipitation: 0,
      visibility: 10000
    });
  });

  describe('optimizeWithWeather', () => {
    it('should optimize route considering weather conditions', async () => {
      const startPoint = { lat: 0, lng: 0 };
      const endPoint = { lat: 1, lng: 1 };
      const preferences = {};

      const result = await advancedOptimizer.optimizeWithWeather(
        startPoint,
        endPoint,
        preferences
      );

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('warnings');
      expect(mockWeatherService.getForecast).toHaveBeenCalledWith(
        startPoint,
        endPoint
      );
    });

    it('should adjust metrics for severe weather', async () => {
      mockWeatherService.getForecast.mockResolvedValueOnce({
        conditions: ['thunderstorm'],
        temperature: 20,
        windSpeed: 40,
        precipitation: 30,
        visibility: 1000
      });

      const result = await advancedOptimizer.optimizeWithWeather(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      expect(result.metrics.weatherImpact).toBeGreaterThan(0);
      expect(result.metrics.safety).toBeLessThan(1);
      expect(result.warnings).toContain('Thunderstorm warning');
      expect(result.warnings).toContain('High wind warning');
    });

    it('should handle weather service errors gracefully', async () => {
      mockWeatherService.getForecast.mockRejectedValueOnce(
        new Error('Weather service error')
      );

      await expect(
        advancedOptimizer.optimizeWithWeather(
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 },
          {}
        )
      ).rejects.toThrow('Failed to optimize route with weather');
    });
  });

  describe('optimizeForTerrain', () => {
    it('should optimize route considering terrain conditions', async () => {
      const startPoint = { lat: 0, lng: 0 };
      const endPoint = { lat: 1, lng: 1 };
      const preferences = { avoidHills: true };

      const result = await advancedOptimizer.optimizeForTerrain(
        startPoint,
        endPoint,
        preferences
      );

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('elevation');
      expect(result.metrics).toHaveProperty('terrainDifficulty');
    });

    it('should generate warnings for difficult terrain', async () => {
      mockMcpService.getElevationProfile.mockResolvedValueOnce({
        points: [
          { distance: 0, elevation: 100 },
          { distance: 500, elevation: 200 },
          { distance: 1000, elevation: 300 }
        ],
        maxGrade: 0.2
      });

      mockMcpService.getRoadConditions.mockResolvedValueOnce({
        condition: 'poor',
        surfaceType: 'unpaved',
        hazards: ['pothole']
      });

      const result = await advancedOptimizer.optimizeForTerrain(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      expect(result.warnings).toContain('Steep grade warning');
      expect(result.warnings).toContain('Poor road conditions');
      expect(result.warnings).toContain('Road hazards reported');
    });

    it('should handle terrain service errors gracefully', async () => {
      mockMcpService.getElevationProfile.mockRejectedValueOnce(
        new Error('Elevation service error')
      );

      await expect(
        advancedOptimizer.optimizeForTerrain(
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 },
          {}
        )
      ).rejects.toThrow('Failed to optimize route for terrain');
    });
  });

  describe('metric calculations', () => {
    it('should calculate correct distance using Haversine formula', async () => {
      const result = await advancedOptimizer.optimizeForTerrain(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      // Approximate distance between 0,0 and 1,1 should be around 157km
      expect(result.metrics.distance).toBeGreaterThan(150000);
      expect(result.metrics.distance).toBeLessThan(160000);
    });

    it('should adjust duration based on terrain difficulty', async () => {
      mockMcpService.getElevationProfile.mockResolvedValueOnce({
        points: [
          { distance: 0, elevation: 100 },
          { distance: 500, elevation: 300 }, // Steep section
          { distance: 1000, elevation: 500 }
        ],
        maxGrade: 0.4
      });

      const result = await advancedOptimizer.optimizeForTerrain(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      const baseResult = await advancedOptimizer.optimizeForTerrain(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      expect(result.metrics.duration).toBeGreaterThan(baseResult.metrics.duration);
    });

    it('should calculate appropriate safety scores', async () => {
      mockWeatherService.getForecast.mockResolvedValueOnce({
        conditions: ['rain', 'fog'],
        temperature: 15,
        windSpeed: 35,
        precipitation: 20,
        visibility: 500
      });

      const result = await advancedOptimizer.optimizeWithWeather(
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        {}
      );

      expect(result.metrics.safety).toBeLessThan(0.8); // Multiple hazards should reduce safety
      expect(result.metrics.safety).toBeGreaterThan(0.3); // Should not go below minimum
    });
  });
}); 