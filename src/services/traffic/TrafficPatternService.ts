import { ServiceInterface, CacheableService } from '../interfaces/ServiceInterface';
import { LatLng } from '@/types/shared';
import { TrafficPattern, TrafficData } from '@/types/traffic';
import { redis } from '@/lib/redis';

export class TrafficPatternService implements ServiceInterface, CacheableService {
  private initialized = false;
  private readonly CACHE_TTL = 86400; // 24 hours

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  async getHistoricalPattern(location: LatLng, dayOfWeek: number, hourOfDay: number): Promise<TrafficPattern> {
    const cacheKey = this.getCacheKey({ type: 'historical', location, dayOfWeek, hourOfDay });
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const pattern = await this.analyzeHistoricalData(location, dayOfWeek, hourOfDay);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(pattern));
    
    return pattern;
  }

  async predictTrafficConditions(location: LatLng, timestamp: Date): Promise<TrafficData> {
    const dayOfWeek = timestamp.getDay();
    const hourOfDay = timestamp.getHours();
    
    const pattern = await this.getHistoricalPattern(location, dayOfWeek, hourOfDay);
    return this.generatePrediction(pattern, timestamp);
  }

  private async analyzeHistoricalData(location: LatLng, dayOfWeek: number, hourOfDay: number): Promise<TrafficPattern> {
    // Here we would typically query a time-series database or analytics service
    // For now, returning mock data
    return {
      dayOfWeek,
      hourOfDay,
      averageSpeed: 45,
      congestionProbability: 0.3,
      confidence: 0.85,
      historicalData: [
        {
          timestamp: new Date(),
          speed: 45,
          congestion: 'low'
        }
      ]
    };
  }

  private async generatePrediction(pattern: TrafficPattern, timestamp: Date): Promise<TrafficData> {
    return {
      timestamp,
      congestionLevel: this.predictCongestionLevel(pattern),
      averageSpeed: pattern.averageSpeed,
      incidents: [],
      segments: []
    };
  }

  private predictCongestionLevel(pattern: TrafficPattern): 'low' | 'moderate' | 'high' {
    if (pattern.congestionProbability < 0.3) return 'low';
    if (pattern.congestionProbability < 0.7) return 'moderate';
    return 'high';
  }

  // CacheableService implementation
  getCacheKey(params: any): string {
    const { type, location, dayOfWeek, hourOfDay } = params;
    return `traffic:pattern:${type}:${location.lat},${location.lng}:${dayOfWeek}:${hourOfDay}`;
  }

  getCacheTTL(): number {
    return this.CACHE_TTL;
  }

  async clearCache(): Promise<void> {
    const keys = await redis.keys('traffic:pattern:*');
    if (keys.length) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  }
} 