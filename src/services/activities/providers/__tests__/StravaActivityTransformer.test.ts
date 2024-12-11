import { StravaActivityTransformer } from '../StravaActivityTransformer';
import { TransformerError } from '@/types/activities/transformer';
import { ActivityMetrics } from '@/types/activities/metrics';

describe('StravaActivityTransformer', () => {
  let transformer: StravaActivityTransformer;
  
  beforeEach(() => {
    transformer = new StravaActivityTransformer();
  });

  describe('transform', () => {
    it('should transform valid Strava activity data', () => {
      const rawData = {
        id: '12345',
        type: 'Ride',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 3600,
        moving_time: 3500,
        distance: 20000,
        total_elevation_gain: 500,
        average_speed: 5.5,
        max_speed: 12.3,
        athlete: { id: 'user123' },
        name: 'Morning Ride',
        description: 'Great ride!'
      };

      const result = transformer.transform(rawData);

      expect(result).toMatchObject({
        providerId: '12345',
        provider: 'strava',
        type: 'ride',
        duration: 3600,
        distance: 20000
      });
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        id: '12345',
        type: 'Ride'
        // missing start_date and elapsed_time
      };

      expect(() => transformer.transform(invalidData))
        .toThrow(TransformerError);
    });
  });

  describe('validateMetrics', () => {
    it('should validate correct metrics', () => {
      const validMetrics = {
        movingTime: 3600,
        elapsedTime: 3700,
        distance: 20000,
        elevationGain: 500,
        elevationLoss: 500,
        averageSpeed: 5.5,
        maxSpeed: 12.3
      };

      expect(() => transformer.validateMetrics(validMetrics))
        .not.toThrow();
    });

    it('should throw error for invalid metric values', () => {
      const invalidMetrics = {
        movingTime: -1,
        elapsedTime: 3700,
        distance: NaN,
        elevationGain: 500,
        elevationLoss: 500,
        averageSpeed: 5.5,
        maxSpeed: 12.3
      };

      expect(() => transformer.validateMetrics(invalidMetrics))
        .toThrow(TransformerError);
    });
  });

  describe('mapActivityType', () => {
    it.each([
      ['Ride', 'ride'],
      ['Run', 'run'],
      ['Swim', 'swim'],
      ['AlpineSki', 'ski'],
      ['Unknown', 'other']
    ])('should map %s to %s', (input, expected) => {
      const result = transformer['mapActivityType'](input);
      expect(result).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional fields', () => {
      const minimalData = {
        id: '12345',
        type: 'Ride',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 3600,
        athlete: { id: 'user123' }
      };

      expect(() => transformer.transform(minimalData)).not.toThrow();
    });

    it('should handle invalid numeric values', () => {
      const invalidData = {
        id: '12345',
        type: 'Ride',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 'invalid',
        moving_time: -1,
        distance: NaN,
        athlete: { id: 'user123' }
      };

      expect(() => transformer.transform(invalidData))
        .toThrow(TransformerError);
    });

    it('should handle unknown activity types', () => {
      const unknownType = {
        id: '12345',
        type: 'UnknownSport',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 3600,
        athlete: { id: 'user123' }
      };

      const result = transformer.transform(unknownType);
      expect(result.type).toBe('other');
    });
  });

  describe('metrics validation', () => {
    it('should validate pace calculations', () => {
      const runningActivity = {
        id: '12345',
        type: 'Run',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 3600,
        moving_time: 3500,
        distance: 10000, // 10km
        average_speed: 2.78, // ~10km/h
        max_speed: 3.33, // ~12km/h
        athlete: { id: 'user123' }
      };

      const result = transformer.transform(runningActivity);
      const metrics = result.metrics as unknown as ActivityMetrics;
      
      expect(metrics.averageSpeed * 3.6).toBeCloseTo(10, 1); // Convert m/s to km/h
      expect(metrics.maxSpeed * 3.6).toBeCloseTo(12, 1);
    });

    it('should handle elevation data correctly', () => {
      const hillClimb = {
        id: '12345',
        type: 'Ride',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 3600,
        moving_time: 3500,
        distance: 20000,
        total_elevation_gain: 500,
        total_elevation_loss: 100,
        athlete: { id: 'user123' }
      };

      const result = transformer.transform(hillClimb);
      const metrics = result.metrics as unknown as ActivityMetrics;
      
      expect(metrics.elevationGain).toBe(500);
      expect(metrics.elevationLoss).toBe(100);
    });
  });
}); 