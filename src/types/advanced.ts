export type OptimizationStrategy = 'balanced' | 'fastest' | 'scenic' | 'eco-friendly';
export type RestStopFrequency = 'low' | 'medium' | 'high';
export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog' | 'unknown';

export interface UserPreferences {
  routeOptimization: OptimizationStrategy;
  avoidHighways: boolean;
  preferScenic: boolean;
  maxElevationGain: number;
  restStopFrequency: RestStopFrequency;
  notifications: {
    weather: boolean;
    hazards: boolean;
    milestones: boolean;
  };
}

export interface FeatureFlags {
  experimentalRouting: boolean;
  weatherAlerts: boolean;
  trafficPrediction: boolean;
  socialSharing: boolean;
  offlineMode: boolean;
}

export interface RouteConstraints {
  weather: {
    maxTemp: number;
    maxWind: number;
    conditions: WeatherCondition[];
  };
  daylight: {
    required: boolean;
    minimumHours?: number;
  };
}

export interface WeatherAlert {
  type: WeatherCondition;
  severity: 'low' | 'moderate' | 'severe';
  affectedSegments: number[];
} 