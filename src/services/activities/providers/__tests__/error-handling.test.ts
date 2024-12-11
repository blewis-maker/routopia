import { StravaActivityTransformer } from '../StravaActivityTransformer';
import { TransformerError } from '@/types/activities/transformer';

describe('StravaActivityTransformer Error Handling', () => {
  let transformer: StravaActivityTransformer;
  
  beforeEach(() => {
    transformer = new StravaActivityTransformer();
  });

  describe('data validation errors', () => {
    it('should handle missing required fields', () => {
      const invalidData = {};
      
      try {
        transformer.transform(invalidData);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(TransformerError);
        expect((error as TransformerError).field).toBe('required_fields');
      }
    });

    it('should handle invalid date formats', () => {
      const invalidData = {
        id: '12345',
        type: 'Ride',
        start_date: 'invalid-date',
        elapsed_time: 3600,
        athlete: { id: 'user123' }
      };
      
      expect(() => transformer.transform(invalidData))
        .toThrow(TransformerError);
    });
  });

  describe('metrics calculation errors', () => {
    it('should handle invalid speed calculations', () => {
      const invalidData = {
        id: '12345',
        type: 'Ride',
        start_date: '2024-03-14T10:00:00Z',
        elapsed_time: 0, // Will cause division by zero
        distance: 1000,
        athlete: { id: 'user123' }
      };
      
      expect(() => transformer.transform(invalidData))
        .toThrow(TransformerError);
    });
  });
}); 