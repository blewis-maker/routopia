// Utility types for search operations
export type SearchOperation<T> = {
  data: T;
  status: SearchStatus;
  error?: Error;
};

export type SearchFilter<T> = (item: T) => boolean;

export type SearchSorter<T> = (a: T, b: T) => number;

export type SearchTransformer<T, R> = (item: T) => R;

// Helper types for search results
export type SearchResultWithDistance = SearchResult & {
  distance: number;
  duration: number;
};

export type SearchResultWithContext = SearchResult & {
  context: {
    weather: EnvironmentalConditions['weather'];
    popularity: number;
    lastVisited?: number;
  };
};

// Type helpers for search state management
export type SearchStateUpdater = <K extends keyof SearchContextState>(
  key: K,
  value: SearchContextState[K]
) => void;

export type SearchActionHandler<T = unknown> = (
  payload: T
) => Promise<void> | void;

// Utility type for search analytics
export type SearchAnalyticsEvent = {
  type: 'search' | 'select' | 'filter' | 'clear';
  payload: Record<string, unknown>;
  timestamp: number;
}; 