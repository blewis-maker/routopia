import { WeatherConditions, GeoPoint, RouteContext, SeasonalConditions } from '@/types/mcp';
import logger from '@/utils/logger';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  precipitation: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
}

export class WeatherService {
  constructor(private apiKey?: string) {}

  async getCurrentWeather(location: GeoPoint): Promise<WeatherConditions> {
    try {
      // TODO: Implement actual weather API integration
      const mockData: WeatherData = {
        temperature: 20,
        feelsLike: 22,
        humidity: 65,
        windSpeed: 5,
        condition: "Clear",
        precipitation: 0,
        visibility: 10000,
        pressure: 1015,
        uvIndex: 5,
        dewPoint: 15,
        cloudCover: 10
      };

      return this.convertToWeatherConditions(mockData);
    } catch (error) {
      logger.error('Error fetching current weather:', { error, location });
      throw error;
    }
  }

  async getWeatherForecast(location: GeoPoint, hours: number = 24): Promise<WeatherConditions[]> {
    // TODO: Implement forecast fetching
    return Array(hours).fill(null).map(() => ({
      temperature: 20,
      conditions: "Clear",
      windSpeed: 5,
      precipitation: 0,
      visibility: 10000,
      details: {
        humidity: 65,
        pressure: 1013,
        dewPoint: 12,
        uvIndex: 5,
        cloudCover: 10
      }
    }));
  }

  async getSeasonalConditions(location: GeoPoint): Promise<SeasonalConditions> {
    // TODO: Implement seasonal conditions fetching
    return {
      snowDepth: 0,
      avalancheRisk: 'low',
      trailCondition: 'dry',
      visibility: 10000,
      temperature: 20,
      windSpeed: 5
    };
  }

  private convertToWeatherConditions(data: WeatherData): WeatherConditions {
    return {
      temperature: data.temperature,
      conditions: this.normalizeCondition(data.condition),
      windSpeed: data.windSpeed,
      precipitation: data.precipitation,
      visibility: data.visibility,
      details: {
        feelsLike: data.feelsLike,
        humidity: data.humidity,
        pressure: data.pressure,
        uvIndex: data.uvIndex,
        dewPoint: data.dewPoint,
        cloudCover: data.cloudCover
      }
    };
  }

  private normalizeCondition(condition: string): string {
    // Normalize weather condition strings
    const conditionMap: { [key: string]: string } = {
      'partly cloudy': 'Partly Cloudy',
      'mostly cloudy': 'Mostly Cloudy',
      'clear': 'Clear',
      'rain': 'Rain',
      'light rain': 'Light Rain',
      'heavy rain': 'Heavy Rain',
      'snow': 'Snow',
      'light snow': 'Light Snow',
      'heavy snow': 'Heavy Snow',
      'thunderstorm': 'Thunderstorm',
      'fog': 'Fog',
      'mist': 'Mist'
    };

    const normalized = condition.toLowerCase();
    return conditionMap[normalized] || condition;
  }

  async getWeatherAlongRoute(route: RouteContext): Promise<Map<string, WeatherConditions>> {
    const weatherMap = new Map<string, WeatherConditions>();
    
    // Sample weather at key points along the route
    const keyPoints = this.getKeyRoutePoints(route);
    
    await Promise.all(
      keyPoints.map(async ([pointId, point]) => {
        const weather = await this.getCurrentWeather(point);
        weatherMap.set(pointId, weather);
      })
    );

    return weatherMap;
  }

  private getKeyRoutePoints(route: RouteContext): [string, GeoPoint][] {
    const points: [string, GeoPoint][] = [
      ['start', route.startPoint],
      ['end', route.endPoint]
    ];

    // Add midpoints for long routes
    if (route.distance > 10000) { // 10km
      const midPoint: GeoPoint = {
        lat: (route.startPoint.lat + route.endPoint.lat) / 2,
        lng: (route.startPoint.lng + route.endPoint.lng) / 2
      };
      points.push(['mid', midPoint]);
    }

    return points;
  }

  async getHazardousConditions(route: RouteContext): Promise<Map<string, string[]>> {
    const hazards = new Map<string, string[]>();
    const weatherMap = await this.getWeatherAlongRoute(route);

    weatherMap.forEach((weather, pointId) => {
      const conditions = this.identifyHazards(weather, route);
      if (conditions.length > 0) {
        hazards.set(pointId, conditions);
      }
    });

    return hazards;
  }

  private identifyHazards(weather: WeatherConditions, route: RouteContext): string[] {
    const hazards: string[] = [];
    const activityType = route.preferences.activityType;

    // Check temperature extremes
    if (weather.temperature > 35) hazards.push('extreme_heat');
    if (weather.temperature < 0) hazards.push('freezing_conditions');

    // Check visibility
    if (weather.visibility < 1000) hazards.push('low_visibility');

    // Check wind conditions
    if (weather.windSpeed > 30) hazards.push('high_winds');

    // Activity-specific hazards
    if (activityType === 'BIKE' && weather.conditions.toLowerCase().includes('rain')) {
      hazards.push('slippery_conditions');
    }

    if (activityType === 'SKI' && weather.conditions.toLowerCase().includes('storm')) {
      hazards.push('dangerous_conditions');
    }

    return hazards;
  }

  async getPointWeather(point: GeoPoint): Promise<WeatherConditions> {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${point.lat},${point.lng}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      return this.transformWeatherData(data);
    } catch (error) {
      logger.error('Error fetching point weather:', error);
      return this.getDefaultWeather();
    }
  }

  async getWeatherForRoute(request: RouteRequest): Promise<WeatherConditions> {
    try {
      // Get weather for start and end points
      const [startWeather, endWeather] = await Promise.all([
        this.getPointWeather(request.startPoint),
        this.getPointWeather(request.endPoint)
      ]);

      // Combine weather conditions
      return this.combineWeatherConditions(startWeather, endWeather);
    } catch (error) {
      logger.error('Error fetching route weather:', error);
      return this.getDefaultWeather();
    }
  }

  private transformWeatherData(data: any): WeatherConditions {
    return {
      temperature: data.current.temp_c,
      conditions: data.current.condition.text,
      windSpeed: data.current.wind_kph,
      precipitation: data.current.precip_mm,
      visibility: data.current.vis_km * 1000, // convert to meters
      details: {
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        dewPoint: data.current.dewpoint_c,
        uvIndex: data.current.uv,
        cloudCover: data.current.cloud
      }
    };
  }

  private combineWeatherConditions(
    start: WeatherConditions,
    end: WeatherConditions
  ): WeatherConditions {
    return {
      temperature: (start.temperature + end.temperature) / 2,
      conditions: this.combineWeatherDescriptions(start.conditions, end.conditions),
      windSpeed: Math.max(start.windSpeed, end.windSpeed),
      precipitation: Math.max(start.precipitation, end.precipitation),
      visibility: Math.min(start.visibility, end.visibility),
      details: {
        humidity: (start.details.humidity + end.details.humidity) / 2,
        pressure: (start.details.pressure + end.details.pressure) / 2,
        dewPoint: (start.details.dewPoint + end.details.dewPoint) / 2,
        uvIndex: Math.max(start.details.uvIndex, end.details.uvIndex),
        cloudCover: Math.max(start.details.cloudCover, end.details.cloudCover)
      }
    };
  }

  private combineWeatherDescriptions(desc1: string, desc2: string): string {
    if (desc1 === desc2) return desc1;
    return `${desc1} to ${desc2}`;
  }

  private getDefaultWeather(): WeatherConditions {
    return {
      temperature: 20,
      conditions: 'Unknown',
      windSpeed: 0,
      precipitation: 0,
      visibility: 10000,
      details: {
        humidity: 50,
        pressure: 1013,
        dewPoint: 10,
        uvIndex: 5,
        cloudCover: 0
      }
    };
  }

  async getWeatherForLocation(location: GeoPoint): Promise<WeatherConditions> {
    try {
      const forecasts = await this.getWeatherForecast(location);
      return forecasts[0] || {
        temperature: 20,
        conditions: 'clear',
        windSpeed: 0,
        precipitation: 0,
        humidity: 50,
        visibility: 10000,
        pressure: 1013,
        uvIndex: 5,
        cloudCover: 0
      };
    } catch (error) {
      logger.error('Failed to get weather for location:', error);
      throw error;
    }
  }

  async getHistoricalWeather(location: GeoPoint, date: Date): Promise<WeatherConditions> {
    // Implementation for getting historical weather
    return {
      temperature: 20,
      conditions: 'clear',
      windSpeed: 0,
      precipitation: 0,
      humidity: 50,
      visibility: 10000,
      pressure: 1013,
      uvIndex: 5,
      cloudCover: 0
    };
  }
} 