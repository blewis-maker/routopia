import axios from 'axios';

export interface WeatherData {
  temperature: number;
  conditions: string;
  windSpeed: number;
  precipitation: number;
}

class WeatherService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/weather',
    });
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const { data } = await this.api.get<WeatherData>('/current', {
        params: { lat, lon },
      });
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(lat: number, lon: number): Promise<WeatherData[]> {
    try {
      const { data } = await this.api.get<WeatherData[]>('/forecast', {
        params: { lat, lon },
      });
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw new Error('Failed to fetch forecast data');
    }
  }
}

export const weatherService = new WeatherService(); 