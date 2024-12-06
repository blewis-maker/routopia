export interface WeatherConditions {
  temperature: number;
  conditions: string;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  cloudCover: number;
  feelsLike?: number;
  dewPoint?: number;
  forecast?: {
    hourly: WeatherConditions[];
    daily: WeatherConditions[];
  };
  alerts?: Array<{
    type: string;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface SeasonalConditions {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  daylight: {
    sunrise: string;
    sunset: string;
    duration: number;
  };
  typical: {
    temperature: {
      min: number;
      max: number;
      average: number;
    };
    precipitation: {
      probability: number;
      amount: number;
    };
    conditions: string[];
  };
} 