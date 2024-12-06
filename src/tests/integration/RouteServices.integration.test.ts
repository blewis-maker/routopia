import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { TimeService } from '@/services/utils/TimeService';
import { DynamicRoutingService } from '@/services/route/DynamicRoutingService';
import { CongestionPredictionService } from '@/services/traffic/CongestionPredictionService';
import { RouteRankingService } from '@/services/route/RouteRankingService';
import { GeoPoint } from '@/types/geo';
import { Route, RoutePreferences } from '@/types/route/types';

describe('Route Services Integration', () => {
  let weatherService: WeatherService;
  let terrainService: TerrainAnalysisService;
  let trafficService: TrafficService;
  let timeService: TimeService;
  let dynamicRoutingService: DynamicRoutingService;
  let congestionService: CongestionPredictionService;
  let rankingService: RouteRankingService;

  const mockLocation: GeoPoint = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockPreferences: RoutePreferences = {
    activityType: 'WALK',
    avoidHighways: true,
    avoidTraffic: true,
    preferScenic: true
  };

  beforeEach(() => {
    timeService = new TimeService();
    weatherService = new WeatherService({} as any); // Replace with mock API client
    terrainService = new TerrainAnalysisService(weatherService, {} as any);
    trafficService = new TrafficService(weatherService, timeService);
    
    dynamicRoutingService = new DynamicRoutingService(
      weatherService,
      terrainService,
      trafficService
    );

    congestionService = new CongestionPredictionService(
      weatherService,
      timeService
    );

    rankingService = new RouteRankingService(
      weatherService,
      terrainService,
      congestionService
    );
  });

  describe('End-to-end route optimization', () => {
    it('should generate and rank routes considering all conditions', async () => {
      // Get initial routes
      const routes = await dynamicRoutingService.generateRoutes(
        mockLocation,
        { ...mockLocation, latitude: mockLocation.latitude + 0.1 },
        mockPreferences
      );

      expect(routes).toBeDefined();
      expect(routes.length).toBeGreaterThan(0);

      // Check terrain conditions
      for (const route of routes) {
        const terrain = await terrainService.getTerrainConditions(route.segments[0].start);
        expect(terrain).toBeDefined();
        expect(terrain.surface).toBeDefined();
        expect(terrain.difficulty).toBeDefined();
      }

      // Check traffic conditions
      const traffic = await trafficService.getCurrentConditions(mockLocation);
      expect(traffic).toBeDefined();
      expect(traffic.level).toBeGreaterThanOrEqual(0);
      expect(traffic.level).toBeLessThanOrEqual(1);

      // Predict congestion
      const congestion = await congestionService.predictCongestion(mockLocation);
      expect(congestion).toBeDefined();
      expect(congestion.predictions.length).toBeGreaterThan(0);

      // Rank routes
      const rankedRoutes = await rankingService.rankRoutes(routes, mockPreferences);
      expect(rankedRoutes).toBeDefined();
      expect(rankedRoutes.length).toBe(routes.length);

      // Verify ranking order
      for (let i = 1; i < rankedRoutes.length; i++) {
        expect(rankedRoutes[i - 1].optimization.score)
          .toBeGreaterThanOrEqual(rankedRoutes[i].optimization.score);
      }
    });

    it('should adapt routes based on changing conditions', async () => {
      // Get initial route
      const initialRoutes = await dynamicRoutingService.generateRoutes(
        mockLocation,
        { ...mockLocation, latitude: mockLocation.latitude + 0.1 },
        mockPreferences
      );

      const initialRoute = initialRoutes[0];
      expect(initialRoute).toBeDefined();

      // Simulate condition changes
      const updates = await dynamicRoutingService.checkForUpdates(initialRoute);
      expect(updates).toBeDefined();

      if (updates.length > 0) {
        const updatedRoute = await dynamicRoutingService.updateRoute(
          initialRoute,
          updates[0]
        );
        expect(updatedRoute).toBeDefined();
        expect(updatedRoute.id).not.toBe(initialRoute.id);
      }
    });

    it('should handle error conditions gracefully', async () => {
      // Test with invalid location
      const invalidLocation: GeoPoint = {
        latitude: 1000,
        longitude: 1000
      };

      await expect(
        dynamicRoutingService.generateRoutes(
          invalidLocation,
          mockLocation,
          mockPreferences
        )
      ).rejects.toThrow();

      // Test with missing weather data
      jest.spyOn(weatherService, 'getWeatherForLocation').mockRejectedValueOnce(new Error('Weather data unavailable'));

      const routes = await dynamicRoutingService.generateRoutes(
        mockLocation,
        { ...mockLocation, latitude: mockLocation.latitude + 0.1 },
        mockPreferences
      );

      expect(routes).toBeDefined();
      expect(routes.length).toBeGreaterThan(0);
    });
  });
}); 