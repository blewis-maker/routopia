import { Route, RouteSegment, RouteMetrics, RoutePreferences, GeoPoint } from '@/types/route/types';
import { WeatherConditions } from '@/types/weather/types';
import { TerrainConditions } from '@/types/terrain/types';

export const mockPoint: GeoPoint = {
  latitude: 40.7128,
  longitude: -74.0060
};

export const mockMetrics: RouteMetrics = {
  distance: 1000,
  duration: 600,
  elevation: {
    gain: 10,
    loss: 5,
    profile: []
  },
  safety: 0.9,
  weatherImpact: 0.1,
  terrainDifficulty: 'easy',
  surfaceType: 'paved',
  trafficImpact: 0.2,
  scenicScore: 0.8,
  pointsOfInterest: 3,
  energyEfficiency: 0.85
};

export const mockSegment: RouteSegment = {
  id: 'segment-1',
  start: mockPoint,
  end: mockPoint,
  startPoint: mockPoint,
  endPoint: mockPoint,
  distance: 1000,
  duration: 600,
  type: 'WALK',
  metrics: mockMetrics
};

export const mockPreferences: RoutePreferences = {
  activityType: 'WALK',
  avoidHighways: true,
  avoidTraffic: true,
  preferScenic: false,
  optimize: 'TIME',
  weights: {
    distance: 0.2,
    duration: 0.3,
    effort: 0.1,
    safety: 0.2,
    comfort: 0.2
  }
};

export const mockWeatherConditions: WeatherConditions = {
  temperature: 20,
  conditions: ['clear'],
  windSpeed: 5,
  precipitation: 0,
  visibility: 10000,
  pressure: 1013,
  forecast: []
};

export const mockTerrainConditions: TerrainConditions = {
  surface: 'paved',
  difficulty: 'easy',
  hazards: [],
  features: [],
  elevation: 100,
  slope: 2,
  aspect: 180,
  roughness: 0.1,
  quality: {
    grip: 0.9,
    stability: 0.9,
    drainage: 0.8,
    maintenance: 0.9,
    wear: 0.1,
    predictedDegradation: 0.01
  }
};

export const mockRoute: Route = {
  id: 'route-1',
  name: 'Test Route',
  segments: [mockSegment],
  preferences: mockPreferences,
  totalMetrics: mockMetrics,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-1'
}; 