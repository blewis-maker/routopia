import { Route, RoutePreferences, RouteSegment } from '@/types/route/types';
import { GeoPoint } from '@/types/geo';
import { TerrainDifficultyLevel, TerrainFeatureType } from '@/types/terrain';
import { WeatherConditions } from '@/types/weather/types';

export const mockLocation: GeoPoint = {
  latitude: 40.7128,
  longitude: -74.0060
};

export const mockPreferences: RoutePreferences = {
  activityType: 'WALK',
  avoidHighways: true,
  avoidTraffic: true,
  preferScenic: true,
  maxDistance: 5000,
  maxDuration: 3600,
  weights: {
    distance: 0.3,
    duration: 0.3,
    effort: 0.1,
    safety: 0.2,
    scenery: 0.1
  }
};

export const mockSegment: RouteSegment = {
  id: 'segment-1',
  start: mockLocation,
  end: {
    latitude: mockLocation.latitude + 0.01,
    longitude: mockLocation.longitude + 0.01
  },
  distance: 1000,
  duration: 600,
  elevation: {
    gain: 10,
    loss: 5,
    points: [0, 2, 5, 8, 10, 8, 5, 2, 0]
  },
  path: [
    mockLocation,
    {
      latitude: mockLocation.latitude + 0.005,
      longitude: mockLocation.longitude + 0.005
    },
    {
      latitude: mockLocation.latitude + 0.01,
      longitude: mockLocation.longitude + 0.01
    }
  ],
  type: 'WALK',
  conditions: {
    weather: {
      temperature: 20,
      conditions: ['clear'],
      windSpeed: 5,
      precipitation: 0,
      visibility: 10000,
      pressure: 1015,
      uvIndex: 5,
      cloudCover: 10
    },
    terrain: {
      surface: 'paved',
      difficulty: TerrainDifficultyLevel.EASY,
      features: [TerrainFeatureType.URBAN, TerrainFeatureType.FLAT],
      elevation: 100,
      slope: 5,
      weather: ['clear'],
      temperature: 20,
      hazards: []
    },
    traffic: {
      timestamp: new Date(),
      level: 0.3,
      speed: 40,
      density: 30,
      confidence: 0.9
    }
  }
};

export const mockRoute: Route = {
  id: 'route-1',
  name: 'Test Route',
  description: 'A test route through the city',
  segments: [mockSegment],
  metrics: {
    distance: 1000,
    duration: 600,
    elevation: {
      totalGain: 10,
      totalLoss: 5,
      maxAltitude: 10,
      minAltitude: 0
    },
    effort: 0.3,
    safety: 0.8,
    scenery: 0.7,
    segments: {
      count: 1,
      types: {
        WALK: 1,
        RUN: 0,
        BIKE: 0,
        DRIVE: 0,
        HIKE: 0,
        MIXED: 0
      }
    },
    conditions: {
      weather: {
        score: 0.9,
        factors: ['clear_conditions', 'good_visibility']
      },
      terrain: {
        score: 0.8,
        factors: ['flat_terrain', 'paved_surface']
      },
      traffic: {
        score: 0.7,
        factors: ['low_congestion']
      }
    }
  },
  alternatives: [
    {
      id: 'alt-1',
      reason: 'Less traffic',
      score: 0.85
    }
  ],
  optimization: {
    score: 0.85,
    factors: [
      {
        name: 'weather',
        impact: 0.9,
        confidence: 0.95
      },
      {
        name: 'terrain',
        impact: 0.8,
        confidence: 0.9
      },
      {
        name: 'traffic',
        impact: 0.7,
        confidence: 0.85
      }
    ],
    lastUpdated: new Date()
  }
}; 