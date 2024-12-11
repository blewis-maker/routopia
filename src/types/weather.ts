export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  conditions: string;
  location: string;
  timestamp: number;
} 