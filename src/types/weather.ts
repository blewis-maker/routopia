export interface WeatherConditions {
  temperature: number;
  conditions: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
  humidity?: number;
  recommendations?: string[];
} 