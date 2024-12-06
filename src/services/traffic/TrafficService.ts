import { GeoPoint } from '@/types/geo';
import { TrafficConditions, TrafficIncident, TrafficUpdate } from '@/types/traffic/types';
import { WeatherService } from '../weather/WeatherService';
import { TimeService } from '../utils/TimeService';
import logger from '@/utils/logger';

export class TrafficService {
  constructor(
    private weatherService: WeatherService,
    private timeService: TimeService
  ) {}

  async getCurrentConditions(location: GeoPoint): Promise<TrafficConditions> {
    try {
      const weather = await this.weatherService.getWeatherForLocation(location);
      const isPeakHour = this.timeService.isPeakHour();
      const isWeekend = this.timeService.isWeekend();

      // Base traffic level calculation
      let level = isPeakHour ? 0.8 : 0.4;
      level *= isWeekend ? 0.7 : 1.0;

      // Weather impact
      if (weather.conditions.includes('rain')) level += 0.2;
      if (weather.conditions.includes('snow')) level += 0.4;
      if (weather.visibility < 5000) level += 0.3;

      return {
        timestamp: new Date(),
        level: Math.min(level, 1.0),
        speed: Math.max(30, 100 * (1 - level)),
        density: level * 100,
        confidence: 0.85
      };
    } catch (error) {
      logger.error('Error getting traffic conditions:', error);
      throw error;
    }
  }

  async getActiveIncidents(location: GeoPoint, radius: number): Promise<TrafficIncident[]> {
    // Implement real incident fetching logic here
    return [];
  }

  async getTrafficUpdate(location: GeoPoint): Promise<TrafficUpdate> {
    const conditions = await this.getCurrentConditions(location);
    const incidents = await this.getActiveIncidents(location, 5000);

    return {
      timestamp: new Date(),
      location,
      conditions,
      incidents,
      predictions: [
        {
          timestamp: new Date(Date.now() + 30 * 60 * 1000),
          conditions: {
            ...conditions,
            confidence: conditions.confidence * 0.9
          }
        }
      ]
    };
  }
} 