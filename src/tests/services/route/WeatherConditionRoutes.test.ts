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

describe('Weather Condition Route Tests', () => {
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

  describe('Extreme Weather Conditions', () => {
    it('should handle heavy snow conditions', async () => {
      const snowWeather: WeatherConditions = {
        temperature: -5,
        precipitation: 20,
        windSpeed: 15,
        conditions: 'heavy_snow',
        visibility: 500,
        snowDepth: 30
      };

      const snowTerrain: TerrainConditions = {
        elevation: 1800,
        surface: 'snow',
        difficulty: TerrainDifficulty.HARD,
        features: [TerrainFeature.SLOPES, TerrainFeature.UNGROOMED]
      };

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.SKI,
        {
          optimize: 'SNOW_CONDITIONS',
          preferGroomed: true,
          weatherSensitivity: 'high',
          difficultyLevel: TerrainDifficulty.MODERATE
        },
        snowWeather,
        snowTerrain
      );

      expect(result.warnings).toContain('Extreme snow conditions');
      expect(result.weatherWarnings).toHaveLength(2);
      expect(result.alternativeRoutes).toBeDefined();
      expect(result.indoorAlternatives).toBeDefined();
    });

    it('should handle extreme heat conditions', async () => {
      const heatWeather: WeatherConditions = {
        temperature: 38,
        precipitation: 0,
        windSpeed: 5,
        conditions: 'clear',
        visibility: 10000,
        humidity: 80
      };

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        {
          optimize: 'SAFETY',
          shadePreference: 'maximum',
          timeOfDay: 'flexible',
          weatherSensitivity: 'high'
        },
        heatWeather
      );

      expect(result.warnings).toContain('Extreme heat conditions');
      expect(result.recommendedStartTime).toBeDefined();
      expect(result.alternativeStartTimes).toHaveLength(3);
    });

    it('should handle flash flood conditions', async () => {
      const floodWeather: WeatherConditions = {
        temperature: 20,
        precipitation: 100,
        windSpeed: 25,
        conditions: 'thunderstorm',
        visibility: 2000,
        floodWarning: true
      };

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.BIKE,
        {
          optimize: 'SAFETY',
          weatherSensitivity: 'high',
          safetyPriority: 'maximum'
        },
        floodWeather
      );

      expect(result.warnings).toContain('Flash flood warning');
      expect(result.indoorAlternatives).toBeDefined();
      expect(result.path).toEqual([]);
    });
  });

  describe('Seasonal Weather Transitions', () => {
    it('should handle weather changes during route', async () => {
      const weatherTransitions: WeatherConditions[] = [
        {
          temperature: 15,
          precipitation: 0,
          windSpeed: 5,
          conditions: 'clear',
          visibility: 10000
        },
        {
          temperature: 12,
          precipitation: 5,
          windSpeed: 15,
          conditions: 'rain',
          visibility: 5000
        }
      ];

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.BIKE,
        {
          optimize: 'SAFETY',
          weatherAdaptive: true,
          timeFlexible: true
        },
        weatherTransitions[0]
      );

      expect(result.weatherTransitions).toHaveLength(2);
      expect(result.alternativeRoutes).toBeDefined();
      expect(result.warnings).toContain('Weather changes expected');
    });
  });

  describe('Mixed Weather Conditions', () => {
    it('should optimize for partial sun and rain', async () => {
      const mixedWeather: WeatherConditions = {
        temperature: 18,
        precipitation: 2,
        windSpeed: 8,
        conditions: 'partially_cloudy',
        visibility: 8000,
        sunCoverage: 0.6
      };

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        {
          optimize: 'COMFORT',
          shadePreference: 'moderate',
          weatherSensitivity: 'medium'
        },
        mixedWeather
      );

      expect(result.metrics.shadePercentage).toBeDefined();
      expect(result.alternativeRoutes).toHaveLength(2);
    });
  });
}); 