import { Redis, RedisOptions } from 'ioredis';
import { POISearchRequest, POIRecommendation, ActivityType } from '../../../types/mcp.types';
import logger from '../utils/logger';

export interface POISearchResult {
  results: POIRecommendation[];
  metadata: {
    total: number;
    radius: number;
    categories: string[];
    searchTime: number;
  };
}

interface SkiLift extends POIRecommendation {
  liftType: 'chairlift' | 'gondola' | 'tbar' | 'rope';
  capacity: number;
  waitTime?: number;
  status: 'open' | 'closed' | 'hold';
  servingRuns: string[];
}

interface SkiRun extends POIRecommendation {
  difficulty: 'green' | 'blue' | 'black' | 'doubleBlack';
  length: number;
  verticalDrop: number;
  status: 'open' | 'closed' | 'grooming';
  conditions: {
    snow: 'powder' | 'packed' | 'icy' | 'spring';
    groomed: boolean;
    snowDepth: number;
  };
}

interface ResortFacility extends POIRecommendation {
  facilityType: 'restaurant' | 'rental' | 'lodge' | 'retail' | 'service';
  currentCapacity?: number;
  maxCapacity?: number;
  services: string[];
  peakHours?: string[];
}

export class POIService {
  private redis: Redis;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_PREFIX = 'poi:';

  constructor(
    private apiKey?: string,
    redisConfig: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0')
    }
  ) {
    this.redis = new Redis(redisConfig);
    this.redis.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });
  }

  async searchPOIs(request: POISearchRequest): Promise<POISearchResult> {
    const cacheKey = this.generateCacheKey(request);
    
    try {
      // Try to get from cache first
      const cachedResult = await this.redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // If not in cache, fetch and store
      const pois = await this.fetchPOIs(request);
      const result: POISearchResult = {
        results: pois,
        metadata: {
          total: pois.length,
          radius: request.radius,
          categories: request.categories || [],
          searchTime: Date.now()
        }
      };
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
      return result;
    } catch (error) {
      logger.error('Error in POI search:', error);
      // Fallback to direct fetch if cache fails
      const pois = await this.fetchPOIs(request);
      return {
        results: pois,
        metadata: {
          total: pois.length,
          radius: request.radius,
          categories: request.categories || [],
          searchTime: Date.now()
        }
      };
    }
  }

  private async fetchPOIs(request: POISearchRequest): Promise<POIRecommendation[]> {
    if (request.activityType === 'SKI') {
      return this.getSkiResortPOIs(request);
    }

    // Default POI handling for other activities
    return [{
      id: 'poi1',
      name: 'Test POI',
      location: request.location,
      category: request.categories?.[0] || 'park',
      recommendedActivities: [request.activityType],
      confidence: 0.9,
      details: {
        description: 'A great place for outdoor activities',
        openingHours: '09:00-17:00',
        amenities: ['parking', 'restrooms'],
        ratings: {
          overall: 4.5,
          aspects: {
            safety: 0.9,
            accessibility: 0.8,
            familyFriendly: 0.9
          }
        }
      }
    }];
  }

  private generateCacheKey(request: POISearchRequest): string {
    return `${this.CACHE_PREFIX}${request.activityType}:${request.location.lat}:${request.location.lng}:${request.radius}:${request.categories?.join(',')}`;
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Error clearing POI cache:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  private async getSkiResortPOIs(request: POISearchRequest): Promise<POIRecommendation[]> {
    const pois: POIRecommendation[] = [];

    // Add lifts
    const lifts: SkiLift[] = [{
      id: 'lift1',
      name: 'Summit Express',
      location: request.location,
      category: 'ski_lift',
      recommendedActivities: ['SKI'],
      confidence: 1.0,
      liftType: 'chairlift',
      capacity: 6,
      waitTime: 5,
      status: 'open',
      servingRuns: ['run1', 'run2', 'run3'],
      details: {
        description: 'High-speed six-pack serving summit terrain',
        openingHours: '09:00-16:00',
        amenities: ['heated seats', 'wind shields'],
        ratings: {
          overall: 4.8,
          aspects: {
            safety: 0.95,
            accessibility: 0.9
          }
        }
      }
    }];
    pois.push(...lifts);

    // Add runs
    const runs: SkiRun[] = [{
      id: 'run1',
      name: 'Powder Paradise',
      location: {
        lat: request.location.lat + 0.001,
        lng: request.location.lng + 0.001
      },
      category: 'ski_run',
      recommendedActivities: ['SKI'],
      confidence: 1.0,
      difficulty: 'blue',
      length: 2500,
      verticalDrop: 500,
      status: 'open',
      conditions: {
        snow: 'powder',
        groomed: true,
        snowDepth: 45
      },
      details: {
        description: 'Long, winding intermediate run with great views',
        openingHours: '09:00-16:00',
        amenities: ['night lighting', 'snow making'],
        ratings: {
          overall: 4.7,
          aspects: {
            safety: 0.9,
            accessibility: 0.85
          }
        }
      }
    }];
    pois.push(...runs);

    // Add facilities
    const facilities: ResortFacility[] = [{
      id: 'facility1',
      name: 'Summit Lodge',
      location: {
        lat: request.location.lat + 0.002,
        lng: request.location.lng + 0.002
      },
      category: 'lodge',
      recommendedActivities: ['SKI'],
      confidence: 1.0,
      facilityType: 'restaurant',
      currentCapacity: 75,
      maxCapacity: 200,
      services: ['dining', 'restrooms', 'lockers', 'ski patrol'],
      peakHours: ['11:30-13:30'],
      details: {
        description: 'Full-service mountain lodge with restaurant and facilities',
        openingHours: '08:30-16:30',
        amenities: ['restaurant', 'bar', 'restrooms', 'lockers', 'ski patrol'],
        ratings: {
          overall: 4.6,
          aspects: {
            safety: 0.95,
            accessibility: 0.9,
            familyFriendly: 0.9
          }
        }
      }
    }];
    pois.push(...facilities);

    return pois;
  }

  private getRelevantCategories(activityType: ActivityType): string[] {
    switch (activityType) {
      case 'SKI':
        return [
          'ski_lift',
          'ski_run',
          'lodge',
          'restaurant',
          'rental',
          'retail',
          'service',
          'parking'
        ];
      case 'WALK':
        return ['park', 'cafe', 'restaurant', 'shopping'];
      case 'BIKE':
        return ['bike_shop', 'park', 'trail_head'];
      case 'RUN':
        return ['park', 'trail_head', 'sports_complex'];
      case 'CAR':
        return ['parking', 'gas_station', 'rest_area'];
      default:
        return [];
    }
  }

  private calculatePOIScore(poi: POIRecommendation, activityType: ActivityType): number {
    let score = poi.confidence;
    
    if (poi.details?.ratings) {
      score += poi.details.ratings.overall / 5;
      
      if (activityType === 'SKI') {
        // Prioritize open lifts and runs with good conditions
        if ('status' in poi && poi.status === 'open') {
          score += 0.3;
        }
        if ('conditions' in poi && (poi as SkiRun).conditions?.snow === 'powder') {
          score += 0.2;
        }
      }
      
      if (poi.details.ratings.aspects?.safety) {
        score += poi.details.ratings.aspects.safety * 0.3;
      }
      
      if (poi.details.ratings.aspects?.accessibility) {
        score += poi.details.ratings.aspects.accessibility * 0.2;
      }
    }
    
    if (poi.recommendedActivities.includes(activityType)) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }
} 