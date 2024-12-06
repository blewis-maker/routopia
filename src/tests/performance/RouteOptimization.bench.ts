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

describe('Route Optimization Performance Benchmarks', () => {
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

  describe('Single Route Optimization', () => {
    it('should optimize simple route within 100ms', async () => {
      const startTime = performance.now();

      await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.WALK,
        {
          optimize: 'TIME',
          avoidHills: true
        }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should optimize complex route with weather within 200ms', async () => {
      const weather: WeatherConditions = {
        temperature: 20,
        precipitation: 0,
        windSpeed: 5,
        conditions: 'clear',
        visibility: 10000
      };

      const terrain: TerrainConditions = {
        elevation: 100,
        surface: 'trail',
        difficulty: TerrainDifficulty.MODERATE,
        features: [TerrainFeature.HILLS, TerrainFeature.TRAIL]
      };

      const startTime = performance.now();

      await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        {
          optimize: 'TERRAIN',
          weatherSensitivity: 'high',
          preferScenic: true,
          avoidTraffic: true
        },
        weather,
        terrain
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Multiple Route Alternatives', () => {
    it('should generate 3 alternatives within 300ms', async () => {
      const startTime = performance.now();

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.BIKE,
        {
          optimize: 'DISTANCE',
          timeFlexible: true,
          maxDetour: 1000
        }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(300);
      expect(result.alternativeRoutes).toHaveLength(3);
    });
  });

  describe('Weather Impact Analysis', () => {
    it('should process weather transitions within 150ms', async () => {
      const weatherTransitions: WeatherConditions[] = [
        {
          temperature: 18,
          precipitation: 0,
          windSpeed: 5,
          conditions: 'clear',
          visibility: 10000
        },
        {
          temperature: 16,
          precipitation: 5,
          windSpeed: 10,
          conditions: 'rain',
          visibility: 5000
        }
      ];

      const startTime = performance.now();

      const result = await optimizer.optimizeRoute(
        mockStartPoint,
        mockEndPoint,
        ActivityType.RUN,
        {
          optimize: 'SAFETY',
          weatherAdaptive: true
        },
        weatherTransitions[0]
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(150);
      expect(result.weatherTransitions).toBeDefined();
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage for large routes', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate a long route with many points
      const longRoute = await optimizer.optimizeRoute(
        mockStartPoint,
        { lat: mockEndPoint.lat + 1, lng: mockEndPoint.lng + 1 },
        ActivityType.BIKE,
        {
          optimize: 'DISTANCE',
          preferScenic: true,
          maxDetour: 5000
        }
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be less than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      expect(longRoute.path.length).toBeGreaterThan(100);
    });
  });
}); 