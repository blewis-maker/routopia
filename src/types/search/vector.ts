import { CombinedRoute } from '@/types/combinedRoute';

export interface VectorMetadata {
  routeId: string;
  activityType?: string;
  difficulty?: string;
  distance?: number;
  terrain?: string[];
  elevation?: {
    gain: number;
    loss: number;
  };
}

export interface SearchOptions {
  activityType?: string;
  difficulty?: string;
  distance?: {
    min?: number;
    max?: number;
  };
  terrain?: string[];
  limit?: number;
  filter?: Record<string, any>;
}

export interface SearchResult extends CombinedRoute {
  score: number;
  metadata?: VectorMetadata;
}

export interface TerrainMetadata {
  primary: string;
  secondary: string[];
  features: string[];
  hazards: string[];
  seasonal: {
    best: string[];
    acceptable: string[];
    avoid: string[];
  };
} 