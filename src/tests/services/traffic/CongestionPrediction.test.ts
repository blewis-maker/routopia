import { CongestionPredictionService } from '@/services/traffic/CongestionPredictionService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TimeService } from '@/services/utils/TimeService';
import { TrafficConditions, TrafficPattern } from '@/types/traffic/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/utils/TimeService');

describe('CongestionPredictionService', () => {
  let service: CongestionPredictionService;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockTimeService: jest.Mocked<TimeService>;
  const location: GeoPoint = { latitude: 40.7128, longitude: -74.0060 };
  const timeRange = {
    start: new Date('2024-01-01T08:00:00'),
    end: new Date('2024-01-01T09:00:00')
  };

  beforeEach(() => {
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockTimeService = new TimeService() as jest.Mocked<TimeService>;

    service = new CongestionPredictionService(
      mockWeatherService,
      mockTimeService
    );
  });

  describe('predictCongestion', () => {
    it('should predict congestion levels for given location and time range', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        temperature: 20,
        conditions: ['clear'],
        windSpeed: 5,
        precipitation: 0,
        humidity: 60,
        visibility: 10000,
        pressure: 1015,
        uvIndex: 5,
        cloudCover: 10
      });

      const predictions = await service.predictCongestion(location, timeRange);

      expect(Array.isArray(predictions)).toBe(true);
      predictions.forEach(prediction => {
        expect(prediction.timestamp).toBeInstanceOf(Date);
        expect(typeof prediction.level).toBe('number');
        expect(typeof prediction.speed).toBe('number');
        expect(typeof prediction.density).toBe('number');
        expect(typeof prediction.confidence).toBe('number');
      });
    });

    it('should adjust predictions based on weather conditions', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        temperature: 20,
        conditions: ['rain', 'heavy'],
        windSpeed: 15,
        precipitation: 10,
        humidity: 90,
        visibility: 2000,
        pressure: 1010,
        uvIndex: 1,
        cloudCover: 100
      });

      const predictions = await service.predictCongestion(location, timeRange);

      predictions.forEach(prediction => {
        expect(prediction.speed).toBeLessThan(50); // Assuming normal speed is higher
        expect(prediction.level).toBeGreaterThan(0.5); // Assuming normal congestion is lower
      });
    });
  });

  describe('analyzeTrend', () => {
    it('should analyze congestion trend over time', async () => {
      const timeRange = {
        start: new Date('2024-01-01T08:00:00'),
        end: new Date('2024-01-01T10:00:00')
      };

      const analysis = await service.analyzeTrend(location, timeRange);

      expect(analysis.trend).toMatch(/improving|stable|worsening/);
      expect(typeof analysis.confidence).toBe('number');
      expect(Array.isArray(analysis.factors)).toBe(true);
      analysis.factors.forEach(factor => {
        expect(typeof factor.type).toBe('string');
        expect(typeof factor.impact).toBe('number');
      });
    });

    it('should identify multiple contributing factors', async () => {
      mockWeatherService.getWeatherForLocation.mockResolvedValue({
        temperature: 20,
        conditions: ['rain', 'wind'],
        windSpeed: 20,
        precipitation: 15,
        humidity: 95,
        visibility: 1000,
        pressure: 1005,
        uvIndex: 1,
        cloudCover: 100
      });

      const timeRange = {
        start: new Date('2024-01-01T08:00:00'),
        end: new Date('2024-01-01T10:00:00')
      };

      const analysis = await service.analyzeTrend(location, timeRange);

      expect(analysis.factors.length).toBeGreaterThan(1);
      expect(analysis.factors.some(f => f.type.includes('weather'))).toBe(true);
      expect(analysis.confidence).toBeLessThan(0.9); // Lower confidence due to severe conditions
    });
  });
}); 