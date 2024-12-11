export interface SkiResort {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
    country: string;
  };
  stats: {
    baseElevation: number;
    peakElevation: number;
    verticalDrop: number;
    lifts: number;
    runs: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface LiftStatus {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'hold' | 'scheduled';
  type: 'chair' | 'gondola' | 'tram' | 'surface';
  capacity: number;
  waitTime?: number;
}

export interface SnowReport {
  lastUpdated: Date;
  newSnow: number;
  baseDepth: number;
  seasonTotal: number;
  conditions: string;
  forecast: {
    date: Date;
    snowfall: number;
    conditions: string;
  }[];
}

export interface TrailMap {
  id: string;
  url: string;
  type: 'summer' | 'winter';
  lastUpdated: Date;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
} 