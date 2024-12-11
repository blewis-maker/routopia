import { CombinedRoute } from '@/types/combinedRoute';
import { RouteSegmentType } from '@/types/route/types';

export const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());

export const mockRoute: CombinedRoute = {
  id: 'test-route-1',
  name: 'Test Route',
  type: 'trail' as RouteSegmentType,
  segments: [],
  waypoints: [],
  metadata: {
    totalDistance: 5000,
    difficulty: 'moderate',
    terrain: {
      primary: 'trail',
      secondary: ['dirt', 'rock'],
      features: [],
      hazards: [],
      seasonal: {
        best: ['summer'],
        acceptable: ['spring', 'fall'],
        avoid: ['winter']
      }
    },
    dining: {
      preferences: {
        cuisineTypes: [],
        priceRange: [],
        dietaryRestrictions: []
      }
    },
    recreation: {
      preferences: {
        activityTypes: [],
        intensity: 'moderate',
        duration: { min: 0, max: 7200 }
      }
    },
    scheduling: {
      preferredStopFrequency: 60,
      restStopDuration: 15
    },
    social: {
      groupSize: 1,
      familyFriendly: true,
      accessibility: []
    },
    recommendations: [],
    conditions: [],
    skillRequirements: {
      technical: [],
      physical: [],
      minimum: 'beginner',
      recommended: 'beginner'
    }
  },
  vectorData: {
    embedding: mockEmbedding,
    description: 'A test hiking route',
    lastUpdated: new Date()
  }
}; 