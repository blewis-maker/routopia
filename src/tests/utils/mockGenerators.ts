import type { 
  Activity,
  ActivityDetails,
  ActivityType,
  Route,
  SearchContext,
  MapState,
  Feedback
} from '../../types';

export const mockGenerators = {
  createMockActivity(type: ActivityType = 'hiking'): ActivityDetails {
    return {
      type,
      metrics: {
        speed: {
          min: 2,
          max: 8,
          average: 4,
          unit: 'km/h'
        },
        elevation: {
          minGain: 0,
          maxGain: 1000,
          preferredGain: 500,
          unit: 'm'
        },
        duration: {
          min: 30,
          max: 240,
          preferred: 120,
          unit: 'minutes'
        }
      },
      requirements: {
        fitness: 'intermediate',
        technical: 'medium',
        equipment: ['hiking_boots', 'water_bottle'],
        season: ['spring', 'summer', 'fall']
      },
      constraints: {
        weather: {
          maxWind: 30,
          maxTemp: 30,
          minTemp: 5,
          conditions: ['clear', 'cloudy']
        },
        daylight: {
          required: true,
          minimumHours: 4
        }
      }
    };
  },

  createMockRoute(): Route {
    return {
      id: 'route_123',
      name: 'Test Route',
      start: {
        coordinates: [45.5231, -122.6765],
        address: '123 Test St'
      },
      end: {
        coordinates: [45.5235, -122.6769],
        address: '456 Test Ave'
      },
      distance: 5000,
      duration: 3600,
      geometry: {
        type: 'LineString',
        coordinates: [
          [45.5231, -122.6765],
          [45.5233, -122.6767],
          [45.5235, -122.6769]
        ]
      }
    };
  },

  createMockSearchContext(): SearchContext {
    return {
      route: {
        start: { lat: 45.5231, lng: -122.6765 },
        end: { lat: 45.5235, lng: -122.6769 },
        activity: 'hiking',
        preferences: {
          difficulty: 'moderate',
          duration: 120,
          elevation: { gain: 500, loss: 500 },
          surface: ['trail']
        }
      },
      intelligence: {
        contextAware: true,
        suggestions: [],
        userPreferences: [],
        conditions: {
          weather: {
            condition: 'clear',
            temperature: 20,
            windSpeed: 10,
            precipitation: 0
          },
          terrain: {
            surface: ['trail'],
            condition: 'dry',
            difficulty: 'moderate'
          },
          daylight: {
            isDaytime: true,
            sunriseTime: 1625140800,
            sunsetTime: 1625191200
          }
        }
      },
      search: {
        query: '',
        results: [],
        status: 'idle',
        filters: {
          activities: ['hiking'],
          difficulty: ['moderate'],
          duration: { min: 60, max: 180 },
          distance: { min: 1000, max: 10000 }
        }
      }
    };
  }
}; 