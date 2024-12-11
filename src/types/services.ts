export interface WeatherConditions {
  temperature: number;
  conditions: string;
  alerts?: string[];
  visibility?: number;
}

export interface TrailConditions {
  status: 'open' | 'closed' | 'warning';
  surface: string;
  hazards: string[];
}

export interface LiftStatus {
  name: string;
  status: 'open' | 'closed';
}

export interface SkiResort {
  stats: {
    openLifts: number;
    totalLifts: number;
    snowDepth: number;
  };
} 