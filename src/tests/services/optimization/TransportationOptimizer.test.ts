import { TransportationOptimizer } from '@/services/optimization/TransportationOptimizer';
import { GeoPoint } from '@/types/geo';
import { UserPreferences } from '@/types/ai/learning';
import { RouteSegment } from '@/types/route/types';

describe('TransportationOptimizer', () => {
  let optimizer: TransportationOptimizer;

  const mockStartPoint: GeoPoint = { lat: 40.7128, lng: -74.0060 };
  const mockEndPoint: GeoPoint = { lat: 40.7589, lng: -73.9851 };
  const mockPreferences: UserPreferences = {
    preferredActivities: ['WALK', 'BIKE'],
    preferredTimes: {
      startHour: 8,
      endHour: 18,
      days: [1, 2, 3, 4, 5]
    },
    weatherPreferences: {
      temperatureRange: [15, 25],
      conditions: ['clear', 'partly_cloudy']
    },
    socialPreferences: {
      groupSize: 1,
      communityEngagement: false,
      privacySettings: {
        shareActivity: false,
        shareLocation: false,
        shareStats: false
      }
    }
  };

  beforeEach(() => {
    optimizer = new TransportationOptimizer();
  });

  describe('optimizeMultiModal', () => {
    it('should return a valid route for simple point-to-point journey', async () => {
      const result = await optimizer.optimizeMultiModal(
        mockStartPoint,
        mockEndPoint,
        mockPreferences
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(segment => {
        expect(segment).toHaveProperty('startPoint');
        expect(segment).toHaveProperty('endPoint');
        expect(segment).toHaveProperty('type');
      });
    });

    it('should handle destinations that are not directly connected', async () => {
      const farPoint: GeoPoint = { lat: 41.8781, lng: -87.6298 }; // Chicago coordinates
      const result = await optimizer.optimizeMultiModal(
        mockStartPoint,
        farPoint,
        mockPreferences
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(1); // Should have multiple segments
    });

    it('should respect user preferences for transport modes', async () => {
      const walkOnlyPreferences: UserPreferences = {
        ...mockPreferences,
        preferredActivities: ['WALK']
      };

      const result = await optimizer.optimizeMultiModal(
        mockStartPoint,
        mockEndPoint,
        walkOnlyPreferences
      );

      result.forEach(segment => {
        expect(segment.type).toBe('WALK');
      });
    });

    it('should optimize for transitions between segments', async () => {
      const result = await optimizer.optimizeMultiModal(
        mockStartPoint,
        mockEndPoint,
        mockPreferences
      );

      // Check that consecutive segments have matching endpoints
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].endPoint).toEqual(result[i + 1].startPoint);
      }
    });

    it('should handle invalid coordinates gracefully', async () => {
      const invalidPoint: GeoPoint = { lat: 200, lng: 200 }; // Invalid coordinates

      await expect(
        optimizer.optimizeMultiModal(mockStartPoint, invalidPoint, mockPreferences)
      ).rejects.toThrow();
    });
  });

  describe('getAvailableTransportModes', () => {
    it('should return all available transport modes for given points', async () => {
      const modes = await optimizer['getAvailableTransportModes'](
        mockStartPoint,
        mockEndPoint
      );

      expect(Array.isArray(modes)).toBe(true);
      expect(modes.length).toBeGreaterThan(0);
      modes.forEach(mode => {
        expect(['walk', 'bike', 'car', 'bus', 'train', 'ski']).toContain(mode);
      });
    });
  });

  describe('getTransitConnections', () => {
    it('should return valid transit connections', async () => {
      const modes = await optimizer['getAvailableTransportModes'](
        mockStartPoint,
        mockEndPoint
      );
      const connections = await optimizer['getTransitConnections'](
        mockStartPoint,
        mockEndPoint,
        modes
      );

      expect(Array.isArray(connections)).toBe(true);
      connections.forEach(connection => {
        expect(connection).toHaveProperty('type');
        expect(connection).toHaveProperty('startPoint');
        expect(connection).toHaveProperty('endPoint');
        expect(connection).toHaveProperty('schedule');
      });
    });
  });

  describe('isAtDestination', () => {
    it('should correctly identify when points are close enough', () => {
      const point1: GeoPoint = { lat: 40.7128, lng: -74.0060 };
      const point2: GeoPoint = { lat: 40.7129, lng: -74.0061 };

      const result = optimizer['isAtDestination'](point1, point2);
      expect(result).toBe(true);
    });

    it('should correctly identify when points are too far apart', () => {
      const point1: GeoPoint = { lat: 40.7128, lng: -74.0060 };
      const point2: GeoPoint = { lat: 41.7128, lng: -75.0060 };

      const result = optimizer['isAtDestination'](point1, point2);
      expect(result).toBe(false);
    });
  });
}); 