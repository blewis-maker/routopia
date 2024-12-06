import { GeoPoint } from '@/types/geo';
import { POIRecommendation, POISearchParams, POISearchResult, POIType } from '@/types/poi';
import { WeatherService } from '../weather/WeatherService';
import { ActivityType } from '@/types/activity';
import logger from '@/utils/logger';

export class POIService {
  constructor(
    private weatherService: WeatherService,
    private apiKey: string
  ) {}

  async searchPOIs(params: POISearchParams): Promise<POISearchResult> {
    try {
      const response = await fetch(`/api/pois/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch POIs');
      }

      const data = await response.json();
      return this.enrichPOIData(data);
    } catch (error) {
      logger.error('Error searching POIs:', error);
      throw error;
    }
  }

  async findNearbyPOIs(
    points: GeoPoint[],
    radius: number = 1000,
    types?: POIType[]
  ): Promise<POIRecommendation[]> {
    try {
      const centerPoint = this.calculateCenterPoint(points);
      const result = await this.searchPOIs({
        location: centerPoint,
        radius,
        type: types,
        limit: 10
      });

      return this.rankPOIsByRelevance(result.pois, points);
    } catch (error) {
      logger.error('Error finding nearby POIs:', error);
      throw error;
    }
  }

  async recommendPOIs(
    route: GeoPoint[],
    activityType: ActivityType,
    preferences: {
      maxDetour?: number;
      poiTypes?: POIType[];
      minRating?: number;
      requireOpenNow?: boolean;
    } = {}
  ): Promise<POIRecommendation[]> {
    try {
      const segments = this.segmentRoute(route);
      const recommendations: POIRecommendation[] = [];

      for (const segment of segments) {
        const nearbyPOIs = await this.findNearbyPOIs(
          segment,
          preferences.maxDetour || 2000,
          preferences.poiTypes
        );

        const filteredPOIs = nearbyPOIs.filter(poi => 
          this.matchesCriteria(poi, preferences) &&
          this.isAccessibleForActivity(poi, activityType)
        );

        recommendations.push(...filteredPOIs);
      }

      return this.deduplicateAndRank(recommendations);
    } catch (error) {
      logger.error('Error recommending POIs:', error);
      throw error;
    }
  }

  private async enrichPOIData(result: POISearchResult): Promise<POISearchResult> {
    const enrichedPOIs = await Promise.all(
      result.pois.map(async poi => {
        const weather = await this.weatherService.getPointWeather(poi.location);
        const popularity = await this.getPopularityData(poi);

        return {
          ...poi,
          weather: {
            current: weather.current.condition,
            forecast: weather.forecast.summary
          },
          popularity
        };
      })
    );

    return {
      ...result,
      pois: enrichedPOIs
    };
  }

  private async getPopularityData(poi: POIRecommendation) {
    try {
      const response = await fetch(`/api/pois/${poi.id}/popularity`);
      if (!response.ok) return undefined;
      return await response.json();
    } catch (error) {
      logger.warn('Error fetching popularity data:', error);
      return undefined;
    }
  }

  private calculateCenterPoint(points: GeoPoint[]): GeoPoint {
    const sum = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / points.length,
      lng: sum.lng / points.length
    };
  }

  private segmentRoute(route: GeoPoint[]): GeoPoint[][] {
    const segments: GeoPoint[][] = [];
    const segmentLength = Math.max(5, Math.floor(route.length / 3));

    for (let i = 0; i < route.length; i += segmentLength) {
      segments.push(route.slice(i, i + segmentLength));
    }

    return segments;
  }

  private matchesCriteria(
    poi: POIRecommendation,
    preferences: {
      minRating?: number;
      requireOpenNow?: boolean;
    }
  ): boolean {
    if (preferences.minRating && poi.rating < preferences.minRating) {
      return false;
    }

    if (preferences.requireOpenNow && !poi.openNow) {
      return false;
    }

    return true;
  }

  private isAccessibleForActivity(
    poi: POIRecommendation,
    activityType: ActivityType
  ): boolean {
    return poi.activities.includes(activityType);
  }

  private rankPOIsByRelevance(
    pois: POIRecommendation[],
    routePoints: GeoPoint[]
  ): POIRecommendation[] {
    return pois.sort((a, b) => {
      const scoreA = this.calculatePOIScore(a, routePoints);
      const scoreB = this.calculatePOIScore(b, routePoints);
      return scoreB - scoreA;
    });
  }

  private calculatePOIScore(
    poi: POIRecommendation,
    routePoints: GeoPoint[]
  ): number {
    const distanceScore = 1 / (1 + poi.distance);
    const ratingScore = poi.rating / 5;
    const popularityScore = poi.popularity
      ? (1 - poi.popularity.current / 100) * 0.5
      : 0;

    const weatherPenalty = poi.weather?.current.includes('rain')
      ? 0.2
      : 0;

    return (
      distanceScore * 0.4 +
      ratingScore * 0.3 +
      popularityScore * 0.2 -
      weatherPenalty
    );
  }

  private deduplicateAndRank(
    pois: POIRecommendation[]
  ): POIRecommendation[] {
    const uniquePOIs = Array.from(
      new Map(pois.map(poi => [poi.id, poi])).values()
    );

    return uniquePOIs.sort((a, b) => {
      if (a.rating === b.rating) {
        return a.distance - b.distance;
      }
      return b.rating - a.rating;
    });
  }
} 