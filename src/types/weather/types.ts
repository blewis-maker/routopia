export interface WeatherConditions {
  temperature: number;
  conditions: string[];
  windSpeed: number;
  precipitation: number;
  visibility: number;
  pressure: number;
  humidity: number;
  severity: number;
  uvIndex: number;
  cloudCover: number;
  timestamp?: Date;
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