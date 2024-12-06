import {
  ActivityType,
  POIResult,
  WeatherData,
  ActivityRecommendation,
  UserPreferences,
  ErrorCode,
  createServerError,
  Point
} from '../types';
import { WeatherService } from './WeatherService';
import { POIService } from './POIService';
import logger from '../utils/logger';

export class ActivityService {
  private weatherService: WeatherService;
  private poiService: POIService;

  constructor(weatherService: WeatherService, poiService: POIService) {
    this.weatherService = weatherService;
    this.poiService = poiService;
  }

  async getRecommendations(
    location: Point,
    preferences: UserPreferences
  ): Promise<ActivityRecommendation[]> {
    try {
      // Get current weather
      const weather = await this.weatherService.getWeatherForRoute({
        startPoint: location,
        endPoint: location,
        preferences: { activityType: ActivityType.WALK } // Default for weather check
      });

      // Get nearby POIs
      const pois = await this.poiService.searchPOIs({
        location,
        radius: 2000, // 2km radius for recommendations
        categories: this.getRelevantCategories(preferences)
      });

      // Generate recommendations
      return this.generateRecommendations(weather, pois.results, preferences);
    } catch (error) {
      logger.error('Failed to generate activity recommendations', { error, location, preferences });
      throw createServerError(
        ErrorCode.RECOMMENDATION_ERROR,
        'Failed to generate activity recommendations'
      );
    }
  }

  private generateRecommendations(
    weather: WeatherData,
    pois: POIResult[],
    preferences: UserPreferences
  ): ActivityRecommendation[] {
    const recommendations: ActivityRecommendation[] = [];
    const weatherImpact = this.weatherService.getWeatherImpact(weather);

    // Group POIs by category
    const poisByCategory = this.groupPOIsByCategory(pois);

    // Generate outdoor activity recommendations if weather permits
    if (this.weatherService.isWeatherSuitableForActivity(weather, true)) {
      recommendations.push(...this.getOutdoorRecommendations(
        weather,
        poisByCategory,
        preferences
      ));
    }

    // Always include indoor alternatives
    recommendations.push(...this.getIndoorRecommendations(
      poisByCategory,
      preferences
    ));

    // Sort by score and limit to top 5
    return this.rankRecommendations(recommendations, weather, preferences)
      .slice(0, 5);
  }

  private getOutdoorRecommendations(
    weather: WeatherData,
    poisByCategory: Record<string, POIResult[]>,
    preferences: UserPreferences
  ): ActivityRecommendation[] {
    const recommendations: ActivityRecommendation[] = [];

    // Walking recommendations
    if (poisByCategory['PARK']?.length > 0) {
      recommendations.push({
        type: ActivityType.WALK,
        title: 'Park Walk',
        description: this.generateDescription(ActivityType.WALK, weather, poisByCategory['PARK'][0]),
        location: poisByCategory['PARK'][0].location,
        duration: 60, // 1 hour
        intensity: 'LOW',
        indoor: false,
        weatherSensitive: true,
        poiCategory: 'PARK'
      });
    }

    // Running recommendations
    if (weather.temperature >= 10 && weather.temperature <= 25) {
      recommendations.push({
        type: ActivityType.RUN,
        title: 'Morning Run',
        description: 'Perfect temperature for a refreshing run',
        location: { lat: 0, lng: 0 }, // Would be populated with actual route start
        duration: 45,
        intensity: 'HIGH',
        indoor: false,
        weatherSensitive: true,
        poiCategory: null
      });
    }

    // Cycling recommendations
    if (weather.windSpeed < 20 && weather.temperature >= 15) {
      recommendations.push({
        type: ActivityType.BIKE,
        title: 'Scenic Bike Ride',
        description: 'Great conditions for cycling',
        location: { lat: 0, lng: 0 }, // Would be populated with actual route start
        duration: 90,
        intensity: 'MEDIUM',
        indoor: false,
        weatherSensitive: true,
        poiCategory: null
      });
    }

    return recommendations;
  }

  private getIndoorRecommendations(
    poisByCategory: Record<string, POIResult[]>,
    preferences: UserPreferences
  ): ActivityRecommendation[] {
    const recommendations: ActivityRecommendation[] = [];

    // Museum visits
    if (poisByCategory['MUSEUM']?.length > 0) {
      recommendations.push({
        type: ActivityType.WALK,
        title: 'Museum Visit',
        description: `Explore ${poisByCategory['MUSEUM'][0].name}`,
        location: poisByCategory['MUSEUM'][0].location,
        duration: 120,
        intensity: 'LOW',
        indoor: true,
        weatherSensitive: false,
        poiCategory: 'MUSEUM'
      });
    }

    // Shopping
    if (poisByCategory['SHOPPING']?.length > 0) {
      recommendations.push({
        type: ActivityType.WALK,
        title: 'Shopping Trip',
        description: `Visit ${poisByCategory['SHOPPING'][0].name}`,
        location: poisByCategory['SHOPPING'][0].location,
        duration: 90,
        intensity: 'LOW',
        indoor: true,
        weatherSensitive: false,
        poiCategory: 'SHOPPING'
      });
    }

    // Entertainment
    if (poisByCategory['ENTERTAINMENT']?.length > 0) {
      recommendations.push({
        type: ActivityType.WALK,
        title: 'Entertainment Venue',
        description: `Visit ${poisByCategory['ENTERTAINMENT'][0].name}`,
        location: poisByCategory['ENTERTAINMENT'][0].location,
        duration: 150,
        intensity: 'LOW',
        indoor: true,
        weatherSensitive: false,
        poiCategory: 'ENTERTAINMENT'
      });
    }

    return recommendations;
  }

  private rankRecommendations(
    recommendations: ActivityRecommendation[],
    weather: WeatherData,
    preferences: UserPreferences
  ): ActivityRecommendation[] {
    return recommendations.sort((a, b) => {
      const scoreA = this.calculateRecommendationScore(a, weather, preferences);
      const scoreB = this.calculateRecommendationScore(b, weather, preferences);
      return scoreB - scoreA;
    });
  }

  private calculateRecommendationScore(
    recommendation: ActivityRecommendation,
    weather: WeatherData,
    preferences: UserPreferences
  ): number {
    let score = 0;

    // Weather compatibility
    if (recommendation.weatherSensitive) {
      const weatherImpact = this.weatherService.getWeatherImpact(weather);
      score -= weatherImpact;
    }

    // Preference matching
    if (preferences.preferredActivities?.includes(recommendation.type)) {
      score += 3;
    }

    // Intensity matching
    if (preferences.preferredIntensity === recommendation.intensity) {
      score += 2;
    }

    // Indoor/outdoor preference
    if (preferences.preferIndoor === recommendation.indoor) {
      score += 2;
    }

    // Duration preference
    const durationDiff = Math.abs(
      (preferences.preferredDuration || 60) - recommendation.duration
    );
    score -= durationDiff / 30; // Penalty for duration mismatch

    return score;
  }

  private groupPOIsByCategory(pois: POIResult[]): Record<string, POIResult[]> {
    return pois.reduce((acc, poi) => {
      if (!acc[poi.category]) {
        acc[poi.category] = [];
      }
      acc[poi.category].push(poi);
      return acc;
    }, {} as Record<string, POIResult[]>);
  }

  private getRelevantCategories(preferences: UserPreferences): string[] {
    const categories = new Set<string>();

    if (preferences.preferIndoor) {
      categories.add('MUSEUM');
      categories.add('SHOPPING');
      categories.add('ENTERTAINMENT');
    } else {
      categories.add('PARK');
      categories.add('LANDMARK');
    }

    if (preferences.preferredActivities?.includes(ActivityType.WALK)) {
      categories.add('CAFE');
    }

    return Array.from(categories);
  }

  private generateDescription(
    activityType: ActivityType,
    weather: WeatherData,
    poi?: POIResult
  ): string {
    const weatherDesc = this.getWeatherDescription(weather);
    const poiDesc = poi ? ` near ${poi.name}` : '';
    
    switch (activityType) {
      case ActivityType.WALK:
        return `Enjoy a pleasant walk${poiDesc}. ${weatherDesc}`;
      case ActivityType.RUN:
        return `Great conditions for a run. ${weatherDesc}`;
      case ActivityType.BIKE:
        return `Perfect weather for cycling. ${weatherDesc}`;
      default:
        return `Explore the area${poiDesc}. ${weatherDesc}`;
    }
  }

  private getWeatherDescription(weather: WeatherData): string {
    const temp = Math.round(weather.temperature);
    const conditions = weather.condition.toLowerCase();
    return `Current temperature is ${temp}°C with ${conditions} conditions.`;
  }
} 