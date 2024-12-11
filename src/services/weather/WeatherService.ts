import { ServiceInterface, CacheableService, RateLimitedService } from '../interfaces/ServiceInterface';
import { WeatherData, WeatherForecast, WeatherAlert } from '@/types/weather';
import { LatLng } from '@/types/shared';
import { redis } from '@/lib/redis';
import { WeatherServiceError, WeatherAPIError, WeatherRateLimitError } from '@/lib/utils/errors/weatherErrors';
import type { WeatherConditions } from '@/types/services';

export class WeatherService implements ServiceInterface, CacheableService, RateLimitedService {
  private initialized = false;
  private apiKey: string;
  private requestCount = 0;
  private lastReset = Date.now();
  private readonly RATE_LIMIT = 60; // requests per minute
  private readonly CACHE_TTL = 900; // 15 minutes

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY!;
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured');
    }
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=London`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCurrentWeather(location: LatLng): Promise<WeatherData> {
    if (this.isRateLimited()) {
      throw new WeatherRateLimitError();
    }

    try {
      const cacheKey = this.getCacheKey({ type: 'current', location });
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${location.lat},${location.lng}`
      );
      
      if (!response.ok) {
        throw new WeatherAPIError(response.statusText, response.status);
      }

      const data = await response.json();
      const weather = this.transformWeatherData(data);
      
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(weather));
      this.requestCount++;
      return weather;
    } catch (error) {
      if (error instanceof WeatherServiceError) throw error;
      throw new WeatherServiceError(`Failed to fetch weather: ${error.message}`);
    }
  }

  async getForecast(location: LatLng, days: number = 3): Promise<WeatherForecast> {
    const cacheKey = this.getCacheKey({ type: 'forecast', location, days });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${location.lat},${location.lng}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const forecast = this.transformForecastData(data);
    
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(forecast));
    return forecast;
  }

  async getAlerts(location: LatLng): Promise<WeatherAlert[]> {
    const cacheKey = this.getCacheKey({ type: 'alerts', location });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const response = await fetch(
      `https://api.weatherapi.com/v1/alerts.json?key=${this.apiKey}&q=${location.lat},${location.lng}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const alerts = this.transformAlertData(data);
    
    await redis.setex(cacheKey, 300, JSON.stringify(alerts));
    return alerts;
  }

  // CacheableService implementation
  getCacheKey(params: { type: string; location: LatLng; days?: number }): string {
    const { type, location, days } = params;
    return `weather:${type}:${location.lat},${location.lng}${days ? `:${days}` : ''}`;
  }

  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  async clearCache(): Promise<void> {
    const keys = await redis.keys('weather:*');
    if (keys.length) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  }

  // RateLimitedService implementation
  getRateLimit(): number {
    return this.RATE_LIMIT;
  }

  getRateLimitWindow(): number {
    return 60000; // 1 minute in milliseconds
  }

  isRateLimited(): boolean {
    const now = Date.now();
    if (now - this.lastReset > this.getRateLimitWindow()) {
      this.requestCount = 0;
      this.lastReset = now;
    }
    return this.requestCount >= this.RATE_LIMIT;
  }

  private transformWeatherData(data: any): WeatherData {
    // Implementation of weather data transformation
    return {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      windSpeed: data.current.wind_kph,
      humidity: data.current.humidity,
      feelsLike: data.current.feelslike_c,
      visibility: data.current.vis_km,
      precipitation: data.current.precip_mm,
      updatedAt: new Date(data.current.last_updated)
    };
  }

  private transformForecastData(data: any): WeatherForecast {
    // Implementation of forecast data transformation
    return {
      daily: data.forecast.forecastday.map((day: any) => ({
        date: new Date(day.date),
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        chanceOfRain: day.day.daily_chance_of_rain,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset
      }))
    };
  }

  private transformAlertData(data: any): WeatherAlert[] {
    // Implementation of alert data transformation
    return data.alerts.alert.map((alert: any) => ({
      title: alert.headline,
      severity: alert.severity,
      message: alert.desc,
      issued: new Date(alert.effective),
      expires: new Date(alert.expires)
    }));
  }

  private async getCachedWeather(location: string) {
    if (!redis) return null;
    
    try {
      const cached = await redis.get(`weather:${location}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Weather cache error:', error);
      return null;
    }
  }

  private async cacheWeather(location: string, data: any) {
    if (!redis) return;
    
    try {
      await redis.setex(`weather:${location}`, 1800, JSON.stringify(data));
    } catch (error) {
      console.error('Weather cache error:', error);
    }
  }

  async getCurrentConditions(location: LatLng): Promise<WeatherConditions> {
    try {
      const response = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`);
      if (!response.ok) throw new Error('Weather service error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return {
        temperature: 0,
        conditions: 'unavailable',
        alerts: ['Weather data unavailable']
      };
    }
  }
} 