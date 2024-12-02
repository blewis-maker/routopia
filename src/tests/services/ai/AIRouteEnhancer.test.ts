import { AIRouteEnhancer } from '@/services/ai/AIRouteEnhancer';
import { ProcessedRoute } from '@/services/routing/RouteProcessor';
import { WeatherData } from '@/services/maps/WeatherLayer';
import { ElevationData } from '@/services/maps/ElevationLayer';
import { PlaceDetails } from '@/services/location/GeocodingService';

describe('AIRouteEnhancer', () => {
  let enhancer: AIRouteEnhancer;
  let mockRoute: ProcessedRoute;
  let mockContext: Partial<RouteContext>;

  beforeEach(() => {
    enhancer = new AIRouteEnhancer();
    mockRoute = {
      coordinates: [[0, 0], [1, 1], [2, 2]],
      duration: 1000
    };
    mockContext = {
      trafficData: {
        congestionLevel: 'low',
        incidents: []
      },
      placeDetails: [],
      elevationProfile: {
        points: [],
        maxElevation: 0,
        minElevation: 0
      },
      weatherConditions: {
        current: {
          temp: 20,
          conditions: 'clear',
          windSpeed: 0,
          precipitation: 0,
          icon: ''
        },
        forecast: []
      },
      businessHours: []
    };
  });

  it('should enhance route with default context', async () => {
    const result = await enhancer.enhanceRoute(mockRoute, {});
    expect(result.routeSuggestions).toBeDefined();
    expect(result.placeRecommendations).toBeDefined();
  });

  it('should generate traffic-aware routes', async () => {
    const alternatives = await enhancer.generateTrafficAwareRoutes(mockRoute);
    expect(alternatives).toBeInstanceOf(Array);
  });

  it('should generate weather-aware routes', async () => {
    const alternatives = await enhancer.generateWeatherAwareRoutes(mockRoute);
    expect(alternatives).toBeInstanceOf(Array);
  });

  it('should generate activity-optimized routes', async () => {
    const alternatives = await enhancer.generateActivityOptimizedRoutes(mockRoute);
    expect(alternatives).toBeInstanceOf(Array);
  });

  it('should filter open places', () => {
    const places: PlaceDetails[] = [
      { name: 'Cafe', businessHours: [{ isOpen: true }] },
      { name: 'Museum', businessHours: [{ isOpen: false }] }
    ];
    const openPlaces = enhancer.filterOpenPlaces(places);
    expect(openPlaces).toHaveLength(1);
    expect(openPlaces[0].name).toBe('Cafe');
  });

  it('should filter highly rated places', () => {
    const places: PlaceDetails[] = [
      { name: 'Cafe', rating: 4.5 },
      { name: 'Museum', rating: 3.5 }
    ];
    const highlyRated = enhancer.filterHighlyRatedPlaces(places);
    expect(highlyRated).toHaveLength(1);
    expect(highlyRated[0].name).toBe('Cafe');
  });

  it('should filter weather-appropriate places', async () => {
    const places: PlaceDetails[] = [
      { name: 'Park', types: ['park'] },
      { name: 'Mall', types: ['shopping_mall'] }
    ];
    const weather: WeatherData = {
      current: {
        temp: 25,
        conditions: 'clear',
        windSpeed: 5,
        precipitation: 0,
        icon: ''
      },
      forecast: []
    };
    const appropriatePlaces = await enhancer.filterWeatherAppropriatePlaces(places, weather);
    expect(appropriatePlaces).toHaveLength(2);
  });
}); 