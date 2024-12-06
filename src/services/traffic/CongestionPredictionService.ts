import { GeoPoint } from '@/types/geo';
import { TrafficConditions, TrafficPattern } from '@/types/traffic/types';
import { WeatherService } from '../weather/WeatherService';
import { TimeService } from '../utils/TimeService';
import logger from '@/utils/logger';

export class CongestionPredictionService {
  private historicalPatterns: Map<string, TrafficPattern[]> = new Map();

  constructor(
    private weatherService: WeatherService,
    private timeService: TimeService
  ) {}

  async predictCongestion(
    location: GeoPoint,
    timeRange: { start: Date; end: Date }
  ): Promise<TrafficConditions[]> {
    try {
      const patterns = await this.getRelevantPatterns(location, timeRange);
      const weather = await this.weatherService.getWeatherForLocation(location);
      
      return this.generatePredictions(patterns, weather, timeRange);
    } catch (error) {
      logger.error('Failed to predict congestion:', error);
      throw error;
    }
  }

  async analyzeTrend(
    location: GeoPoint,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
    factors: Array<{ type: string; impact: number }>;
  }> {
    try {
      const predictions = await this.predictCongestion(location, timeRange);
      return this.calculateTrend(predictions);
    } catch (error) {
      logger.error('Failed to analyze trend:', error);
      throw error;
    }
  }

  private async getRelevantPatterns(
    location: GeoPoint,
    timeRange: { start: Date; end: Date }
  ): Promise<TrafficPattern[]> {
    const key = this.generateLocationKey(location);
    let patterns = this.historicalPatterns.get(key) || [];

    if (patterns.length === 0) {
      patterns = await this.loadHistoricalPatterns(location);
      this.historicalPatterns.set(key, patterns);
    }

    return this.filterRelevantPatterns(patterns, timeRange);
  }

  private generateLocationKey(location: GeoPoint): string {
    return `${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;
  }

  private async loadHistoricalPatterns(location: GeoPoint): Promise<TrafficPattern[]> {
    // Implement historical pattern loading logic
    return [];
  }

  private filterRelevantPatterns(
    patterns: TrafficPattern[],
    timeRange: { start: Date; end: Date }
  ): TrafficPattern[] {
    const dayOfWeek = timeRange.start.getDay();
    const hourOfDay = timeRange.start.getHours();

    return patterns.filter(pattern => 
      pattern.dayOfWeek === dayOfWeek &&
      pattern.hourRange.start <= hourOfDay &&
      pattern.hourRange.end >= hourOfDay
    );
  }

  private async generatePredictions(
    patterns: TrafficPattern[],
    weather: any,
    timeRange: { start: Date; end: Date }
  ): Promise<TrafficConditions[]> {
    const predictions: TrafficConditions[] = [];
    const weatherImpact = this.calculateWeatherImpact(weather);

    for (const pattern of patterns) {
      predictions.push({
        timestamp: new Date(),
        level: this.adjustForWeather(pattern.baseLevel, weatherImpact),
        speed: this.adjustForWeather(pattern.baseSpeed, weatherImpact),
        density: this.adjustForWeather(pattern.baseDensity, weatherImpact),
        confidence: pattern.confidence * weatherImpact.confidence
      });
    }

    return predictions;
  }

  private calculateWeatherImpact(weather: any): {
    factor: number;
    confidence: number;
  } {
    // Implement weather impact calculation logic
    return {
      factor: 1.0,
      confidence: 0.8
    };
  }

  private adjustForWeather(baseValue: number, weatherImpact: { factor: number }): number {
    return baseValue * weatherImpact.factor;
  }

  private calculateTrend(predictions: TrafficConditions[]): {
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
    factors: Array<{ type: string; impact: number }>;
  } {
    if (predictions.length < 2) {
      return {
        trend: 'stable',
        confidence: 0.5,
        factors: []
      };
    }

    const levels = predictions.map(p => p.level);
    const trend = this.analyzeTrendDirection(levels);
    const confidence = this.calculateTrendConfidence(predictions);
    const factors = this.identifyTrendFactors(predictions);

    return {
      trend,
      confidence,
      factors
    };
  }

  private analyzeTrendDirection(levels: number[]): 'improving' | 'stable' | 'worsening' {
    const firstHalf = levels.slice(0, Math.floor(levels.length / 2));
    const secondHalf = levels.slice(Math.floor(levels.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (Math.abs(secondAvg - firstAvg) < 0.1) return 'stable';
    return secondAvg < firstAvg ? 'improving' : 'worsening';
  }

  private calculateTrendConfidence(predictions: TrafficConditions[]): number {
    return predictions.reduce((acc, pred) => acc + pred.confidence, 0) / predictions.length;
  }

  private identifyTrendFactors(predictions: TrafficConditions[]): Array<{ type: string; impact: number }> {
    // Implement trend factors identification logic
    return [];
  }
} 