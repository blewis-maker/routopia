import type { 
  SearchResult, 
  ActivityType, 
  EnvironmentalConditions,
  Coordinates 
} from '@/types/search';

export const typeGuards = {
  isSearchResult(value: unknown): value is SearchResult {
    if (!value || typeof value !== 'object') return false;
    
    const result = value as SearchResult;
    return (
      typeof result.id === 'string' &&
      typeof result.name === 'string' &&
      Array.isArray(result.coordinates) &&
      result.coordinates.length === 2 &&
      ['location', 'route', 'activity'].includes(result.type)
    );
  },

  isValidCoordinates(value: unknown): value is Coordinates {
    if (!value || typeof value !== 'object') return false;
    
    const coords = value as Coordinates;
    return (
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      (coords.altitude === undefined || typeof coords.altitude === 'number')
    );
  },

  isValidActivityType(value: unknown): value is ActivityType {
    const validTypes: ActivityType[] = [
      'hiking', 'cycling', 'running', 'skiing', 'walking', 'climbing'
    ];
    return typeof value === 'string' && validTypes.includes(value as ActivityType);
  },

  isValidConditions(value: unknown): value is EnvironmentalConditions {
    if (!value || typeof value !== 'object') return false;
    
    const conditions = value as EnvironmentalConditions;
    return (
      conditions.weather &&
      conditions.terrain &&
      conditions.daylight &&
      typeof conditions.weather.temperature === 'number' &&
      typeof conditions.terrain.difficulty === 'string' &&
      typeof conditions.daylight.isDaytime === 'boolean'
    );
  }
}; 

export type TypographyScale = 
  | 'xs' 
  | 'sm' 
  | 'base' 
  | 'lg' 
  | 'xl' 
  | '2xl' 
  | '3xl' 
  | '4xl' 
  | '5xl'

export type ColorToken = 
  | 'primary' 
  | 'primary-dark'
  | 'secondary'
  | 'secondary-dark'
  | 'bg-primary'
  | 'bg-secondary'
  | 'bg-hover'
  | 'text-primary'
  | 'text-secondary'

export const isTypographyScale = (value: unknown): value is TypographyScale => {
  const validScales = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']
  return typeof value === 'string' && validScales.includes(value)
}

export const isColorToken = (value: unknown): value is ColorToken => {
  const validTokens = [
    'primary',
    'primary-dark',
    'secondary',
    'secondary-dark',
    'bg-primary',
    'bg-secondary',
    'bg-hover',
    'text-primary',
    'text-secondary'
  ]
  return typeof value === 'string' && validTokens.includes(value)
} 