import { WeatherService } from '@/services/weather/WeatherService';
import { POIService } from '@/services/poi/POIService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { RealTimeOptimizer } from '@/services/route/RealTimeOptimizer';
import { RouteService } from '@/services/route/RouteService';
import { 
  RouteSegment,
  RouteMetrics,
  TerrainConditions,
  OptimizationResult 
} from '@/types/route/types';
import { WeatherConditions } from '@/types/weather';
import { GeoPoint } from '@/types/geo';

export class MockWeatherService extends WeatherService {
  private mockWeather: WeatherConditions = {
    temperature: 20,
    conditions: 'clear',
    windSpeed: 5,
    precipitation: 0,
    humidity: 60,
    visibility: 10000,
    pressure: 1013,
    uvIndex: 5,
    cloudCover: 10
  };

  setMockWeather(weather: WeatherConditions) {
    this.mockWeather = weather;
  }

  async getWeatherForLocation(_location: GeoPoint): Promise<WeatherConditions> {
    return this.mockWeather;
  }
}

export class MockPOIService extends POIService {
  private mockPOIs: any[] = [];

  setMockPOIs(pois: any[]) {
    this.mockPOIs = pois;
  }

  async getNearbyPOIs(_location: GeoPoint, _radius: number): Promise<any[]> {
    return this.mockPOIs;
  }
}

export class MockMCPService extends MCPIntegrationService {
  private mockTerrain: TerrainConditions = {
    elevation: 100,
    surface: 'paved',
    difficulty: 'moderate',
    features: ['flat', 'urban']
  };

  setMockTerrain(terrain: TerrainConditions) {
    this.mockTerrain = terrain;
  }

  async getTerrainConditions(_location: GeoPoint): Promise<TerrainConditions> {
    return this.mockTerrain;
  }
}

export class MockRealTimeOptimizer extends RealTimeOptimizer {
  private mockOptimizationResult: OptimizationResult = {
    path: [],
    metrics: {
      distance: 1000,
      duration: 600,
      elevation: {
        gain: 10,
        loss: 5,
        profile: []
      },
      safety: 0.9,
      weatherImpact: 0.1,
      terrainDifficulty: 0.3
    }
  };

  setMockOptimizationResult(result: OptimizationResult) {
    this.mockOptimizationResult = result;
  }

  async optimizeRoute(
    _segment: RouteSegment,
    _weather?: WeatherConditions,
    _terrain?: TerrainConditions
  ): Promise<OptimizationResult> {
    return this.mockOptimizationResult;
  }
}

export class MockRouteService extends RouteService {
  private mockRouteResult: {
    segments: {
      path: GeoPoint[];
      metrics: RouteMetrics;
      type: string;
    }[];
    totalDistance: number;
    estimatedDuration: number;
  } = {
    segments: [],
    totalDistance: 0,
    estimatedDuration: 0
  };

  setMockRouteResult(result: any) {
    this.mockRouteResult = result;
  }

  async createMultiSegmentRoute(_segments: RouteSegment[]) {
    return this.mockRouteResult;
  }
}

export const createMockRouteResult = (
  numSegments: number,
  baseDistance: number = 1000,
  baseDuration: number = 600
) => {
  const segments = Array(numSegments).fill(null).map((_, index) => ({
    path: [
      { lat: 40.7128, lng: -74.0060 },
      { lat: 40.7128 + (0.01 * index), lng: -74.0060 + (0.01 * index) }
    ],
    metrics: {
      distance: baseDistance * (index + 1),
      duration: baseDuration * (index + 1),
      elevation: {
        gain: 10 * (index + 1),
        loss: 5 * (index + 1),
        profile: []
      },
      safety: 0.9,
      weatherImpact: 0.1,
      terrainDifficulty: 0.3
    },
    type: index % 2 === 0 ? 'WALK' : 'BIKE'
  }));

  return {
    segments,
    totalDistance: segments.reduce((acc, s) => acc + s.metrics.distance, 0),
    estimatedDuration: segments.reduce((acc, s) => acc + s.metrics.duration, 0)
  };
}; 