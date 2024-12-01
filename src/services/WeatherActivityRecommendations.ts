import type { 
  WeatherCondition, 
  ActivitySuitability, 
  WeatherTrend,
  OptimalTimeSlot 
} from '@/types/weather';

export class WeatherActivityRecommendations {
  private weatherAnalytics: WeatherAnalytics;
  private activityMatcher: ActivityMatcher;

  async generateRecommendations(
    location: GeoLocation,
    preferences: ActivityPreferences
  ): Promise<ActivityRecommendation[]> {
    const forecast = await this.weatherAnalytics.getDetailedForecast(location);
    const trends = this.weatherAnalytics.analyzeTrends(forecast);
    
    return {
      optimalActivities: this.findOptimalActivities(forecast, preferences),
      timeSlots: this.identifyOptimalTimeSlots(forecast, preferences),
      alternativeActivities: this.suggestAlternatives(forecast, preferences),
      weatherAlerts: this.generateWeatherAlerts(forecast, preferences),
      adaptationSuggestions: this.createAdaptationSuggestions(forecast)
    };
  }

  private findOptimalActivities(
    forecast: WeatherForecast,
    preferences: ActivityPreferences
  ): OptimalActivity[] {
    return preferences.activities
      .map(activity => ({
        activity,
        suitability: this.calculateActivitySuitability(activity, forecast),
        recommendations: this.generateActivityRecommendations(activity, forecast)
      }))
      .sort((a, b) => b.suitability.score - a.suitability.score);
  }

  private calculateActivitySuitability(
    activity: Activity,
    forecast: WeatherForecast
  ): ActivitySuitability {
    return {
      score: this.computeSuitabilityScore(activity, forecast),
      factors: this.analyzeSuitabilityFactors(activity, forecast),
      risks: this.assessWeatherRisks(activity, forecast),
      recommendations: this.generateSafetyRecommendations(activity, forecast)
    };
  }
} 