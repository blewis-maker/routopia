import { WeatherRequest, WeatherConditions } from '../../../types/mcp.types';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitation: number;
}

export class WeatherService {
  constructor(private apiKey?: string) {}

  async getWeatherForRoute(request: WeatherRequest): Promise<WeatherConditions> {
    // For now, return mock data that matches WeatherConditions type
    return {
      temperature: 20,
      windSpeed: 10,
      precipitation: {
        type: 'none',
        intensity: 'none'
      },
      visibility: 10000,
      snowDepth: request.preferences.activityType === 'SKI' ? 30 : undefined,
      avalancheRisk: request.preferences.activityType === 'SKI' ? 'low' : undefined
    };
  }

  private convertToWeatherConditions(data: WeatherData): WeatherConditions {
    return {
      temperature: data.temperature,
      windSpeed: data.windSpeed,
      precipitation: {
        type: this.getPrecipitationType(data),
        intensity: this.getPrecipitationIntensity(data)
      },
      visibility: 10000, // Default value, should be fetched from weather API
      snowDepth: this.getSnowDepth(data),
      avalancheRisk: this.getAvalancheRisk(data)
    };
  }

  private getPrecipitationType(data: WeatherData): 'none' | 'rain' | 'snow' {
    if (data.precipitation === 0) return 'none';
    return data.temperature <= 0 ? 'snow' : 'rain';
  }

  private getPrecipitationIntensity(data: WeatherData): 'none' | 'light' | 'moderate' | 'heavy' {
    if (data.precipitation === 0) return 'none';
    if (data.precipitation < 2.5) return 'light';
    if (data.precipitation < 7.6) return 'moderate';
    return 'heavy';
  }

  private getSnowDepth(data: WeatherData): number | undefined {
    if (data.temperature <= 0 && data.condition.toLowerCase().includes('snow')) {
      return data.precipitation * 10; // Rough conversion from precipitation to snow depth
    }
    return undefined;
  }

  private getAvalancheRisk(data: WeatherData): 'low' | 'moderate' | 'high' | undefined {
    if (data.temperature <= 0 && data.condition.toLowerCase().includes('snow')) {
      if (data.precipitation > 10) return 'high';
      if (data.precipitation > 5) return 'moderate';
      return 'low';
    }
    return undefined;
  }
} 