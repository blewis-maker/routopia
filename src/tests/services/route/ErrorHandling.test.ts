import { WeatherService } from '@/services/weather/WeatherService';
import { MCPIntegrationService } from '@/services/mcp/MCPIntegrationService';
import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { 
  ActivityType, 
  GeoPoint, 
  WeatherConditions,
  TerrainConditions,
  TerrainDifficulty,
  TerrainFeature
} from '@/types';

describe('Route Optimization Error Handling', () => {
  let optimizer: RealTimeOptimizer;
  let weatherService: jest.Mocked<WeatherService>;
  let mcpService: jest.Mocked<MCPIntegrationService>;

  const mockStartPoint: GeoPoint = { lat: 45.5, lng: -122.6 };
  const mockEndPoint: GeoPoint = { lat: 45.6, lng: -122.7 };

  beforeEach(() => {
    weatherService = {
      getWeatherForLocation: jest.fn(),
    } as any;
    mcpService = {
      getTerrainConditions: jest.fn(),
    } as any;
    optimizer = new RealTimeOptimizer(weatherService, mcpService);
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid coordinates gracefully', async () => {
      const invalidStartPoint: GeoPoint = { lat: 91, lng: -122.6 }; // Invalid latitude

      await expect(
        optimizer.optimizeRoute(
          invalidStartPoint,
          mockEndPoint,
          ActivityType.WALK,
          { optimize: 'TIME' }
        )
      ).rejects.toThrow('Invalid coordinates');
    });

    it('should handle missing required preferences', async () => {
      await expect(
        optimizer.optimizeRoute(
          mockStartPoint,
          mockEndPoint,
          ActivityType.BIKE,
          {} as any
        )
      ).rejects.toThrow('Missing required optimization preference');
    });

    it('should validate activity type compatibility', async () => {
      const snowTerrain: TerrainConditions = {
        elevation: 1800,
        surface: 'snow',
        difficulty: TerrainDifficulty.HARD,
        features: [TerrainFeature.SLOPES]
      };

      await expect(
        optimizer.optimizeRoute(
          mockStartPoint,
          mockEndPoint,
          ActivityType.BIKE,
          { optimize: 'SNOW_CONDITIONS' },
          undefined,
          snowTerrain
        )
      ).rejects.toThrow('Incompatible activity type for snow conditions');
    });
  });

  describe('Service Failures', () => {
    it('should handle weather service failures', async () => {
      weatherService.getWeatherForLocation.mockRejectedValue(new Error('Weather service unavailable'));

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.WALK,
        { optimize: 'SAFETY' }
      );

      expect(result.warnings).toContain('Weather data unavailable');
      expect(result.path).toBeDefined(); // Should still provide a basic route
    });

    it('should handle terrain service failures', async () => {
      mcpService.getTerrainConditions.mockRejectedValue(new Error('Terrain service unavailable'));

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.HIKE,
        { optimize: 'TERRAIN' }
      );

      expect(result.warnings).toContain('Terrain data unavailable');
      expect(result.path).toBeDefined();
    });

    it('should handle multiple service failures gracefully', async () => {
      weatherService.getWeatherForLocation.mockRejectedValue(new Error('Weather service error'));
      mcpService.getTerrainConditions.mockRejectedValue(new Error('Terrain service error'));

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        {
          optimize: 'SAFETY',
          weatherSensitivity: 'high'
        }
      );

      expect(result.warnings).toContain('Limited optimization available');
      expect(result.path).toBeDefined();
      expect(result.alternativeRoutes).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-distance routes', async () => {
      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockStartPoint,
        ActivityType.WALK,
        { optimize: 'TIME' }
      );

      expect(result.path).toEqual([mockStartPoint]);
      expect(result.metrics.distance).toBe(0);
    });

    it('should handle extremely long routes', async () => {
      const farEndPoint: GeoPoint = { lat: mockEndPoint.lat + 10, lng: mockEndPoint.lng + 10 };

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        farEndPoint,
        ActivityType.BIKE,
        { optimize: 'DISTANCE' }
      );

      expect(result.warnings).toContain('Route exceeds recommended distance');
      expect(result.alternativeRoutes).toBeDefined();
    });

    it('should handle routes crossing date line', async () => {
      const dateLineCrossing: GeoPoint = { lat: 45.5, lng: 179.9 };
      const dateLineCrossing2: GeoPoint = { lat: 45.5, lng: -179.9 };

      const result = await optimizer.optimizeRoute(
        dateLineCrossing,
        dateLineCrossing2,
        ActivityType.BIKE,
        { optimize: 'DISTANCE' }
      );

      expect(result.path.length).toBeGreaterThan(0);
      expect(result.warnings).not.toContain('Invalid route calculation');
    });
  });

  describe('Recovery Strategies', () => {
    it('should fallback to simplified optimization when services fail', async () => {
      weatherService.getWeatherForLocation.mockRejectedValue(new Error('Service unavailable'));

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.WALK,
        {
          optimize: 'SAFETY',
          weatherSensitivity: 'high'
        }
      );

      expect(result.path).toBeDefined();
      expect(result.warnings).toContain('Using simplified optimization');
    });

    it('should retry failed service calls', async () => {
      let attempts = 0;
      weatherService.getWeatherForLocation.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({
          temperature: 20,
          precipitation: 0,
          windSpeed: 5,
          conditions: 'clear',
          visibility: 10000
        });
      });

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        { optimize: 'SAFETY' }
      );

      expect(attempts).toBe(3);
      expect(result.warnings).not.toContain('Weather data unavailable');
    });

    it('should maintain data consistency during partial failures', async () => {
      const weather: WeatherConditions = {
        temperature: 20,
        precipitation: 0,
        windSpeed: 5,
        conditions: 'clear',
        visibility: 10000
      };

      weatherService.getWeatherForLocation.mockResolvedValue(weather);
      mcpService.getTerrainConditions.mockRejectedValue(new Error('Service unavailable'));

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.HIKE,
        {
          optimize: 'TERRAIN',
          weatherSensitivity: 'high'
        }
      );

      expect(result.metrics.weatherImpact).toBeDefined();
      expect(result.metrics.terrainDifficulty).toBe(TerrainDifficulty.UNKNOWN);
    });
  });
}); 