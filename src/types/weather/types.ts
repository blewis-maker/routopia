export interface WeatherConditions {
  temperature: number;
  humidity: number;
  conditions: string[];
  windSpeed: number;
  windDirection?: number;
  precipitation: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  cloudCover: number;
  feelsLike?: number;
  dewPoint?: number;
}

export interface WeatherForecast {
  timestamp: Date;
  conditions: WeatherConditions;
  probability: number;
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  startTime: Date;
  endTime: Date;
  affectedAreas: string[];
}

export interface WeatherHistory {
  startDate: Date;
  endDate: Date;
  readings: Array<{
    timestamp: Date;
    conditions: WeatherConditions;
  }>;
  summary: {
    averageTemp: number;
    averageHumidity: number;
    dominantConditions: string[];
  };
} 