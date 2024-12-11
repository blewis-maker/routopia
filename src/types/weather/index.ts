import { GeoPoint } from '../geo';

export interface WeatherConditions {
  temperature: number;
  conditions: string[];
  windSpeed: number;
  precipitation: number;
  visibility: number;
  locations?: Array<{
    point: GeoPoint;
    conditions: string[];
    temperature: number;
    windSpeed: number;
  }>;
  microClimates?: Array<{
    point: GeoPoint;
    localEffects: LocalWeatherEffects;
  }>;
  details?: {
    humidity: number;
    pressure: number;
    dewPoint: number;
    uvIndex: number;
    cloudCover: number;
  };
}

export interface LocalWeatherEffects {
  temperature: number;
  wind: {
    speed: number;
    direction: number;
  };
  precipitation: number;
}

export interface MicroClimate {
  temperature: {
    current: number;
    variation: number;
    microEffects: Array<{
      type: string;
      impact: number;
      confidence: number;
    }>;
  };
  wind: {
    speed: number;
    direction: number;
    patterns: Array<{
      type: string;
      probability: number;
      timing?: {
        start: string;
        peak: string;
        end: string;
      };
      direction?: number;
      intensity?: number;
    }>;
    tunnelEffects: Array<{
      type: string;
      intensification: number;
      direction: number;
      location?: GeoPoint;
    }>;
  };
  precipitation: {
    intensity: number;
    localized: {
      orographicEffect: number;
      urbanEffect: number;
      patterns: Array<{
        type: string;
        probability: number;
        intensity: number;
      }>;
    };
    accumulation: {
      rate: number;
      drainage: {
        pattern: string;
        efficiency: number;
      };
      retention: number;
    };
  };
  sunExposure: {
    dailyPattern: {
      sunrise: string;
      sunset: string;
      peakIntensity: number;
      shadingPeriods: Array<{
        start: string;
        end: string;
        intensity: number;
      }>;
    };
    shadingEffects: Array<{
      type: string;
      coverage: number;
      timing?: {
        start: string;
        end: string;
      };
    }>;
    seasonalVariation: {
      current: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      nextPeak: string;
    };
  };
  terrainEffects: {
    elevation: {
      impact: number;
      temperatureGradient: number;
      pressureEffect: number;
    };
    slope: {
      angle: number;
      aspect: number;
      effect: number;
    };
    vegetation: {
      type: string;
      coverage: number;
      effect: number;
    };
    urbanization: {
      intensity: number;
      heatIslandEffect: number;
      airQualityImpact: number;
    };
  };
}

export interface WeatherPattern {
  type: 'seasonal' | 'daily' | 'terrain' | 'urban' | 'custom';
  probability: number;
  duration: {
    start: string;
    end: string;
  };
  conditions: {
    temperature?: {
      min: number;
      max: number;
      trend: 'rising' | 'falling' | 'stable';
    };
    precipitation?: {
      probability: number;
      intensity: number;
      type: string;
    };
    wind?: {
      speed: {
        min: number;
        max: number;
      };
      direction: number;
      gustProbability: number;
    };
    visibility?: {
      distance: number;
      conditions: string[];
    };
  };
  confidence: number;
  source: 'historical' | 'forecast' | 'analysis';
  impacts: Array<{
    type: string;
    severity: number;
    description: string;
  }>;
}

export interface WeatherAlert {
  title: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  message: string;
  issued: Date;
  expires: Date;
  location: GeoPoint;
  timing: {
    start: string;
    end: string;
  };
  conditions: string[];
  impacts: Array<{
    type: string;
    probability: number;
    severity: number;
  }>;
  recommendations: string[];
}

export type WeatherTrend = {
  parameter: string;
  values: number[];
  timestamps: string[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  confidence: number;
  seasonalAdjusted: boolean;
};

export interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  feelsLike: number;
  visibility: number;
  precipitation: number;
  updatedAt: Date;
}

export interface DailyForecast {
  date: Date;
  maxTemp: number;
  minTemp: number;
  condition: string;
  chanceOfRain: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherForecast {
  daily: DailyForecast[];
}

export interface WeatherAlert {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  message: string;
  issued: Date;
  expires: Date;
}

export type WeatherCondition = 
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'fog'
  | 'windy'; 