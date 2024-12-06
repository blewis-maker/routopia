import { AIService } from './AIService';
import { WeatherService } from '../weather/WeatherService';
import { POIService } from '../poi/POIService';
import { RouteService } from '../route/RouteService';
import { RouteRecommendationRequest, AIContext, AIResponse } from '@/types/ai';
import { ActivityType, ActivityPreferences } from '@/types/activity';
import { GeoPoint } from '@/types/geo';
import { POIRecommendation } from '@/types/poi';
import logger from '@/utils/logger';

export class RecommendationService {
  private aiService: AIService;

  constructor(
    private weatherService: WeatherService,
    private poiService: POIService,
    private routeService: RouteService,
    apiKey: string
  ) {
    this.aiService = new AIService(apiKey, weatherService, poiService, routeService);
  }

  async getRouteRecommendations(request: RouteRecommendationRequest): Promise<AIResponse> {
    try {
      // Gather context data
      const [weather, pois] = await Promise.all([
        this.weatherService.getPointWeather(request.location),
        this.poiService.findNearbyPOIs([request.location], request.radius)
      ]);

      // Build AI context
      const context: AIContext = {
        location: request.location,
        activity: request.activityType,
        preferences: request.preferences,
        weather,
        pois,
        sessionContext: {
          startTime: Date.now(),
          lastInteraction: Date.now(),
          interactionCount: 0
        }
      };

      // Get AI recommendations
      return await this.aiService.processRequest({
        type: 'recommendation',
        context,
        input: this.buildRecommendationPrompt(request)
      });
    } catch (error) {
      logger.error('Error getting route recommendations:', error);
      throw error;
    }
  }

  async getPersonalizedSuggestions(
    location: GeoPoint,
    activityType: ActivityType,
    preferences: ActivityPreferences
  ): Promise<POIRecommendation[]> {
    try {
      const pois = await this.poiService.findNearbyPOIs([location]);
      const weather = await this.weatherService.getPointWeather(location);

      // Filter and rank POIs based on preferences and conditions
      const rankedPois = await this.rankPOIsForActivity(
        pois,
        activityType,
        preferences,
        weather
      );

      return rankedPois;
    } catch (error) {
      logger.error('Error getting personalized suggestions:', error);
      throw error;
    }
  }

  private async rankPOIsForActivity(
    pois: POIRecommendation[],
    activityType: ActivityType,
    preferences: ActivityPreferences,
    weather: any
  ): Promise<POIRecommendation[]> {
    // Score each POI based on multiple factors
    const scoredPois = pois.map(poi => {
      const scores = {
        activityMatch: this.calculateActivityMatchScore(poi, activityType),
        weatherSuitability: this.calculateWeatherScore(poi, weather, preferences),
        facilityMatch: this.calculateFacilityScore(poi, preferences),
        socialMatch: this.calculateSocialScore(poi, preferences),
        timeMatch: this.calculateTimeScore(poi, preferences)
      };

      const totalScore = 
        scores.activityMatch * 0.3 +
        scores.weatherSuitability * 0.2 +
        scores.facilityMatch * 0.2 +
        scores.socialMatch * 0.15 +
        scores.timeMatch * 0.15;

      return { ...poi, score: totalScore };
    });

    // Sort by score and return top recommendations
    return scoredPois
      .sort((a, b) => (b as any).score - (a as any).score)
      .map(({ score, ...poi }) => poi);
  }

  private calculateActivityMatchScore(
    poi: POIRecommendation,
    activityType: ActivityType
  ): number {
    if (!poi.activities.includes(activityType)) return 0;
    return 1;
  }

  private calculateWeatherScore(
    poi: POIRecommendation,
    weather: any,
    preferences: ActivityPreferences
  ): number {
    let score = 1;

    if (preferences.comfort) {
      // Temperature check
      if (
        preferences.comfort.maxTemperature &&
        weather.temperature > preferences.comfort.maxTemperature
      ) {
        score *= 0.5;
      }

      if (
        preferences.comfort.minTemperature &&
        weather.temperature < preferences.comfort.minTemperature
      ) {
        score *= 0.5;
      }

      // Precipitation check
      if (
        preferences.comfort.avoidPrecipitation &&
        weather.precipitation > 0
      ) {
        score *= 0.3;
      }

      // Wind check
      if (
        preferences.comfort.maxWindSpeed &&
        weather.windSpeed > preferences.comfort.maxWindSpeed
      ) {
        score *= 0.4;
      }
    }

    return score;
  }

  private calculateFacilityScore(
    poi: POIRecommendation,
    preferences: ActivityPreferences
  ): number {
    if (!preferences.facilities) return 1;

    let score = 1;
    const requiredAmenities = preferences.facilities.requiredAmenities || [];

    if (requiredAmenities.length > 0) {
      const matchingAmenities = requiredAmenities.filter(
        amenity => poi.amenities.includes(amenity)
      );
      score *= matchingAmenities.length / requiredAmenities.length;
    }

    return score;
  }

  private calculateSocialScore(
    poi: POIRecommendation,
    preferences: ActivityPreferences
  ): number {
    if (!preferences.social || !poi.popularity) return 1;

    let score = 1;

    if (preferences.social.avoidCrowds && poi.popularity.current > 0.7) {
      score *= 0.5;
    }

    if (preferences.social.preferPopular && poi.popularity.typical > 0.7) {
      score *= 1.5;
    }

    return Math.min(score, 1);
  }

  private calculateTimeScore(
    poi: POIRecommendation,
    preferences: ActivityPreferences
  ): number {
    if (!preferences.schedule || !poi.openingHours) return 1;

    let score = 1;
    const currentHour = new Date().getHours();

    // Check if within preferred time
    if (
      preferences.schedule.preferredTimeOfDay &&
      preferences.schedule.preferredTimeOfDay.length > 0
    ) {
      const isPreferredTime = preferences.schedule.preferredTimeOfDay.some(
        timeRange => this.isWithinTimeRange(currentHour, timeRange)
      );
      if (!isPreferredTime) score *= 0.7;
    }

    // Check if avoiding peak hours
    if (
      preferences.schedule.avoidPeakHours &&
      poi.popularity?.typical > 0.8
    ) {
      score *= 0.6;
    }

    return score;
  }

  private isWithinTimeRange(hour: number, timeRange: string): boolean {
    const [start, end] = timeRange.split('-').map(t => parseInt(t));
    return hour >= start && hour <= end;
  }

  private buildRecommendationPrompt(request: RouteRecommendationRequest): string {
    return `Recommend routes and points of interest for a ${request.activityType} activity:
Location: ${request.location.lat}, ${request.location.lng}
Time Available: ${request.timeAvailable || 'flexible'} minutes
Preferences: ${JSON.stringify(request.preferences)}
Include Popular: ${request.includePopular ? 'yes' : 'no'}
Weather Sensitive: ${request.weatherSensitive ? 'yes' : 'no'}`;
  }
} 