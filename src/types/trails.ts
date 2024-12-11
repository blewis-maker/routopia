import { LatLng, ActivityType } from './activities';

export interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: TrailDifficulty;
  length: number;
  elevation: {
    gain: number;
    loss: number;
    peak: number;
  };
  coordinates: LatLng[];
  activities: ActivityType[];
  surface: TrailSurface[];
  amenities: TrailAmenity[];
  conditions: TrailConditions;
  seasonality: SeasonStatus[];
}

export type TrailDifficulty = 'easy' | 'moderate' | 'difficult' | 'expert';

export type TrailSurface = 'paved' | 'gravel' | 'dirt' | 'rock' | 'snow' | 'ice';

export type TrailAmenity = 
  | 'parking'
  | 'restroom'
  | 'water'
  | 'picnic'
  | 'camping'
  | 'viewpoint';

export interface TrailConditions {
  status: 'open' | 'closed' | 'warning';
  lastUpdated: Date;
  surface: {
    condition: string;
    hazards?: string[];
  };
  weather: {
    snow?: number;
    ice?: boolean;
    mud?: boolean;
  };
  alerts?: string[];
}

export interface SeasonStatus {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  status: 'ideal' | 'good' | 'fair' | 'poor' | 'closed';
}

export interface TrailSearchParams {
  location: LatLng;
  radius: number;
  activities?: ActivityType[];
  difficulty?: TrailDifficulty[];
  length?: {
    min?: number;
    max?: number;
  };
  elevation?: {
    minGain?: number;
    maxGain?: number;
  };
  surface?: TrailSurface[];
  amenities?: TrailAmenity[];
} 