export interface MapSettings {
  showTraffic: boolean;
  show3DBuildings: boolean;
  style: 'streets' | 'satellite' | 'terrain' | 'dark';
  language: string;
  zoom: number;
}

export interface DisplaySettings {
  units: 'metric' | 'imperial';
  highContrast: boolean;
  enableAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
  routeUpdates: boolean;
  trafficAlerts: boolean;
  weatherAlerts: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface SearchFilters {
  type: 'all' | 'poi' | 'address' | 'trail';
  radius: number;
  activityType: ActivityType;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type: 'poi' | 'address' | 'trail';
  metadata?: {
    rating?: number;
    openNow?: boolean;
    distance?: number;
    elevation?: number;
  };
} 