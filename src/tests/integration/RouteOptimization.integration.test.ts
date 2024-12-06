import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { DynamicRoutingService } from '@/services/route/DynamicRoutingService';
import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { Route, RoutePreferences } from '@/types/route/types';
import { GeoPoint } from '@/types/geo';

describe('Route Optimization Integration', () => {
  let weatherService: WeatherService;
  let terrainService: TerrainAnalysisService;
  let trafficService: TrafficService;
  let dynamicRoutingService: DynamicRoutingService;
  let realTimeOptimizer: RealTimeOptimizer;

  const mockLocation: GeoPoint = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockRoute: Route = {
    id: 'test-route-1',
    name: 'Test Route',
    segments: [
      {
        id: 'segment-1',
        startPoint: mockLocation,
        endPoint: { latitude: 40.7589, longitude: -73.9851 },
        activityType: 'WALK',
        distance: 1000,
        duration: 1200,
        metrics: {
          elevation: { gain: 10, loss: 5, profile: [] },
          safety: 0.9,
          weatherImpact: 0.2,
          terrainDifficulty: 'easy',
          surfaceType: 'paved'
        }
      }
    ],
    preferences: {
      activityType: 'WALK',
      avoidHighways: true,
      avoidTraffic: true,
      preferScenic: false
    }
  };

  beforeEach(() => {
    weatherService = new WeatherService();
    terrainService = new TerrainAnalysisService(weatherService);
    trafficService = new TrafficService();
    dynamicRoutingService = new DynamicRoutingService(
      weatherService,
      terrainService,
      trafficService
    );
    realTimeOptimizer = new RealTimeOptimizer(
      weatherService,
      terrainService,
      trafficService
    );
  });

  describe('Dynamic Route Adaptation', () => {
    it('should suggest reroute when weather conditions deteriorate', async () => {
      // Mock deteriorating weather conditions
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['rain', 'wind'],
        temperature: 15,
        windSpeed: 25,
        visibility: 5000,
        precipitation: 10
      });

      const result = await dynamicRoutingService.calculateRerouteNecessity(
        mockRoute,
        mockLocation,
        mockRoute.preferences
      );

      expect(result.shouldReroute).toBe(true);
      expect(result.severity).toBeGreaterThan(0.5);
      expect(result.reason).toContain('adverse_weather');
    });

    it('should generate alternative routes when reroute is necessary', async () => {
      // Mock weather and traffic conditions
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['rain'],
        temperature: 15,
        windSpeed: 20,
        visibility: 8000,
        precipitation: 5
      });

      jest.spyOn(trafficService, 'getCurrentConditions').mockResolvedValue({
        level: 0.8,
        timestamp: new Date(),
        confidence: 0.9
      });

      const alternatives = await dynamicRoutingService.generateAlternativeRoutes(
        mockRoute,
        mockLocation,
        mockRoute.preferences
      );

      expect(alternatives.length).toBeGreaterThan(0);
      alternatives.forEach(route => {
        expect(route.segments.length).toBeGreaterThan(0);
        expect(route.segments[0].metrics.safety).toBeDefined();
        expect(route.segments[0].metrics.weatherImpact).toBeDefined();
      });
    });
  });

  describe('Activity-Specific Optimization', () => {
    it('should optimize bike routes considering weather and terrain', async () => {
      const bikePreferences: RoutePreferences = {
        activityType: 'BIKE',
        avoidHighways: true,
        avoidTraffic: true,
        preferScenic: false
      };

      const optimizedRoute = await realTimeOptimizer.optimizeBikeRoute(
        mockLocation,
        { latitude: 40.7589, longitude: -73.9851 },
        bikePreferences,
        {
          conditions: ['clear'],
          temperature: 20,
          windSpeed: 10,
          visibility: 10000,
          precipitation: 0
        },
        {
          surface: 'paved',
          difficulty: 'easy',
          hazards: []
        }
      );

      expect(optimizedRoute.metrics.safety).toBeGreaterThan(0.7);
      expect(optimizedRoute.warnings).toHaveLength(0);
    });

    it('should optimize ski routes based on snow conditions', async () => {
      const skiPreferences: RoutePreferences = {
        activityType: 'SKI',
        avoidHighways: false,
        avoidTraffic: false,
        preferScenic: true
      };

      const optimizedRoute = await realTimeOptimizer.optimizeSkiRoute(
        mockLocation,
        { latitude: 40.7589, longitude: -73.9851 },
        skiPreferences,
        {
          conditions: ['snow'],
          temperature: 0,
          windSpeed: 5,
          visibility: 2000,
          precipitation: 2
        },
        {
          surface: 'snow',
          difficulty: 'intermediate',
          hazards: []
        }
      );

      expect(optimizedRoute.metrics.safety).toBeGreaterThan(0.6);
      expect(optimizedRoute.warnings).not.toContain('poor_snow_conditions');
    });

    it('should optimize pedestrian routes prioritizing safety', async () => {
      const walkPreferences: RoutePreferences = {
        activityType: 'WALK',
        avoidHighways: true,
        avoidTraffic: true,
        preferScenic: true
      };

      const optimizedRoute = await realTimeOptimizer.optimizePedestrianRoute(
        mockLocation,
        { latitude: 40.7589, longitude: -73.9851 },
        walkPreferences,
        {
          conditions: ['clear'],
          temperature: 20,
          windSpeed: 5,
          visibility: 10000,
          precipitation: 0
        },
        {
          surface: 'paved',
          difficulty: 'easy',
          hazards: []
        }
      );

      expect(optimizedRoute.metrics.safety).toBeGreaterThan(0.8);
      expect(optimizedRoute.path).toBeDefined();
      expect(optimizedRoute.metrics.terrainDifficulty).toBe('easy');
    });
  });

  describe('Error Handling', () => {
    it('should handle weather service failures gracefully', async () => {
      jest.spyOn(weatherService, 'getWeatherForLocation').mockRejectedValue(new Error('API Error'));

      const result = await dynamicRoutingService.calculateRerouteNecessity(
        mockRoute,
        mockLocation,
        mockRoute.preferences
      );

      expect(result.shouldReroute).toBe(false);
      expect(result.reason).toBe('service_error');
    });

    it('should fall back to default route when optimization fails', async () => {
      jest.spyOn(terrainService, 'getTerrainConditions').mockRejectedValue(new Error('Service Error'));

      const alternatives = await dynamicRoutingService.generateAlternativeRoutes(
        mockRoute,
        mockLocation,
        mockRoute.preferences
      );

      expect(alternatives).toHaveLength(1);
      expect(alternatives[0]).toEqual(mockRoute);
    });
  });

  describe('Performance', () => {
    it('should optimize routes within acceptable time limits', async () => {
      const start = Date.now();

      await Promise.all([
        dynamicRoutingService.generateAlternativeRoutes(
          mockRoute,
          mockLocation,
          mockRoute.preferences
        ),
        realTimeOptimizer.optimizeBikeRoute(
          mockLocation,
          { latitude: 40.7589, longitude: -73.9851 },
          { ...mockRoute.preferences, activityType: 'BIKE' }
        ),
        realTimeOptimizer.optimizePedestrianRoute(
          mockLocation,
          { latitude: 40.7589, longitude: -73.9851 },
          mockRoute.preferences
        )
      ]);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 