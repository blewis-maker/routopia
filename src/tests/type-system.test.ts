import { 
  ActivityType, 
  SearchResult, 
  SearchContext,
  ValidationRules,
  EnhancedValidation 
} from '@/types';

describe('Type System Validation', () => {
  describe('Activity Types', () => {
    it('should validate activity types correctly', () => {
      const validActivity: ActivityType = 'hiking';
      const invalidActivity: any = 'invalid-activity';
      
      expect(isValidActivityType(validActivity)).toBe(true);
      expect(isValidActivityType(invalidActivity)).toBe(false);
    });

    it('should validate activity details', () => {
      const validDetails: ActivityDetails = {
        type: 'hiking',
        metrics: {
          speed: { min: 2, max: 5, average: 3.5, unit: 'km/h' },
          elevation: { minGain: 0, maxGain: 1000, preferredGain: 500, unit: 'm' },
          duration: { min: 30, max: 480, preferred: 120, unit: 'minutes' }
        },
        requirements: {
          fitness: 'intermediate',
          technical: 'medium',
          equipment: ['hiking-boots', 'water-bottle'],
          season: ['spring', 'summer', 'fall']
        },
        constraints: {
          weather: {
            maxWind: 30,
            maxTemp: 35,
            minTemp: 5,
            conditions: ['clear', 'cloudy']
          },
          daylight: {
            required: true,
            minimumHours: 4
          }
        }
      };

      const result = EnhancedValidation.activity(validDetails);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Search Context', () => {
    it('should validate search context', () => {
      const validContext: SearchContext = {
        route: {
          start: { lat: 40.7128, lng: -74.0060 },
          activity: 'hiking',
          preferences: {
            difficulty: 'moderate',
            duration: 120,
            elevation: { gain: 500, loss: 500 },
            surface: ['trail']
          }
        },
        // ... other required properties
      };

      const result = EnhancedValidation.searchContext(validContext);
      expect(result.isValid).toBe(true);
    });
  });
}); 