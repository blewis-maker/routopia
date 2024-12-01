import type { 
  ActivityType, 
  ActivityDetails, 
  SearchResult, 
  SearchContext 
} from '@/types';

export const ValidationRules = {
  coordinates: {
    lat: { min: -90, max: 90 },
    lng: { min: -180, max: 180 },
    altitude: { min: -500, max: 9000 }
  },
  
  duration: {
    min: 5, // minutes
    max: 720 // 12 hours
  },
  
  distance: {
    min: 0.1, // km
    max: 200 // km
  }
};

export const EnhancedValidation = {
  activity: (details: ActivityDetails): ValidationResult => {
    const errors: string[] = [];
    
    // Validate speed ranges
    if (details.metrics.speed.min >= details.metrics.speed.max) {
      errors.push('Invalid speed range');
    }
    
    // Validate elevation
    if (details.metrics.elevation.maxGain < details.metrics.elevation.minGain) {
      errors.push('Invalid elevation range');
    }
    
    // Validate duration
    if (details.metrics.duration.min < ValidationRules.duration.min ||
        details.metrics.duration.max > ValidationRules.duration.max) {
      errors.push('Duration out of valid range');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  searchContext: (context: SearchContext): ValidationResult => {
    const errors: string[] = [];
    
    // Validate coordinates
    if (context.route.start) {
      if (!isValidCoordinate(context.route.start)) {
        errors.push('Invalid start coordinates');
      }
    }
    
    // Validate activity type
    if (!isValidActivityType(context.route.activity)) {
      errors.push('Invalid activity type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function isValidCoordinate(coord: any): boolean {
  return (
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    coord.lat >= ValidationRules.coordinates.lat.min &&
    coord.lat <= ValidationRules.coordinates.lat.max &&
    coord.lng >= ValidationRules.coordinates.lng.min &&
    coord.lng <= ValidationRules.coordinates.lng.max
  );
}

function isValidActivityType(type: any): type is ActivityType {
  return Object.values(ActivityType).includes(type);
} 