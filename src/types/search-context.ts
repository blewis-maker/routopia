import type { ActivityType, EnvironmentalConditions, ActivityPreferences } from './activities';

export interface SearchContextEnhanced extends SearchContext {
  // Enhanced routing context
  routing: {
    currentLocation?: Coordinates;
    destination?: Coordinates;
    waypoints: Coordinates[];
    activity: {
      type: ActivityType;
      preferences: ActivityPreferences;
    };
    alternatives: RouteAlternative[];
  };

  // Enhanced intelligence context
  intelligence: {
    contextAware: boolean;
    suggestions: SearchSuggestion[];
    userPreferences: UserPreference[];
    conditions: EnvironmentalConditions;
    confidence: number;
    lastUpdated: number;
  };

  // Enhanced search state
  search: {
    query: string;
    results: SearchResult[];
    status: SearchStatus;
    filters: SearchFilters;
    history: SearchHistory;
    pagination: SearchPagination;
  };
}

interface SearchHistory {
  recent: RecentSearch[];
  popular: PopularSearch[];
  saved: SavedSearch[];
}

interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface RouteAlternative {
  id: string;
  name: string;
  difficulty: string;
  duration: number;
  distance: number;
  elevation: {
    gain: number;
    loss: number;
  };
  coordinates: Coordinates[];
} 