export interface SearchResult {
  id: string;
  name: string;
  type: 'location' | 'route' | 'activity';
  coordinates: [number, number];
  description?: string;
  popularity?: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: 'location' | 'route' | 'activity';
}

export interface SearchComponentProps {
  onSelect: (result: SearchResult) => void;
  onFocus?: () => void;
  selectedValue?: SearchResult | null;
}

export interface SearchContextState {
  isActive: boolean;
  query: string;
  results: SearchResult[];
  selectedResult: SearchResult | null;
}

export interface SearchContext {
  // Core routing types
  route: {
    start: Coordinates;
    end: Coordinates;
    waypoints?: Coordinates[];
    activity: ActivityType;
    preferences: RoutePreferences;
  };

  // AI integration types
  intelligence: {
    contextAware: boolean;
    suggestions: SearchSuggestion[];
    userPreferences: UserPreference[];
    conditions: EnvironmentalConditions;
  };

  // Essential search types
  search: {
    query: string;
    results: SearchResult[];
    status: SearchStatus;
    filters: SearchFilters;
  };
}

export interface Coordinates {
  lat: number;
  lng: number;
  altitude?: number;
}

export interface RoutePreferences {
  difficulty: 'easy' | 'moderate' | 'hard';
  duration: number; // in minutes
  elevation: {
    gain: number;
    loss: number;
  };
  surface: SurfaceType[];
}

export interface SearchSuggestion {
  id: string;
  type: 'route' | 'location' | 'activity';
  confidence: number;
  source: 'ai' | 'popular' | 'recent';
  context?: Record<string, unknown>;
}

export type SearchStatus = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'no-results';

export interface SearchFilters {
  activities: ActivityType[];
  difficulty: string[];
  duration: {
    min: number;
    max: number;
  };
  distance: {
    min: number;
    max: number;
  };
} 