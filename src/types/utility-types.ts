// Generic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<Result<T>>;

// Result types
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata?: Record<string, unknown>;
}

// Search-specific utility types
export type SearchParams<T extends Record<string, any>> = {
  [K in keyof T]?: T[K] | T[K][];
};

export type SearchOptions = {
  limit?: number;
  offset?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  include?: string[];
};

// Route-specific utility types
export type RouteSegment = {
  start: Coordinates;
  end: Coordinates;
  distance: number;
  duration: number;
  elevation: {
    gain: number;
    loss: number;
  };
};

export type RouteMetrics = {
  totalDistance: number;
  totalDuration: number;
  totalElevation: {
    gain: number;
    loss: number;
  };
  segments: RouteSegment[];
}; 