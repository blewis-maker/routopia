import { CoreActivityType, WeatherConditions } from '@/types/activities';
import { UserPreferences } from '@/types/user';

export class TimeBasedRecommender {
  getTimeBasedRecommendations(
    activityType: CoreActivityType,
    context: {
      hour: number;
      weather: WeatherConditions;
      userPrefs?: UserPreferences;
      dayOfWeek: number;
    }
  ): string[] {
    const recommendations: string[] = [];
    const { hour, weather, dayOfWeek } = context;

    // Add day-specific recommendations
    this.addDaySpecificRecommendations(recommendations, dayOfWeek, activityType);
    
    // Add weather-time combinations
    this.addWeatherTimeRecommendations(recommendations, hour, weather, activityType);
    
    // Add user preference based timing
    if (context.userPrefs) {
      this.addUserPreferenceTimings(recommendations, context.userPrefs, hour);
    }

    return recommendations;
  }

  private addDaySpecificRecommendations(
    recommendations: string[],
    dayOfWeek: number,
    activityType: CoreActivityType
  ): void {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    switch (activityType) {
      case 'Bike':
      case 'Run':
        if (!isWeekend) {
          recommendations.push('🚗 Weekday traffic patterns in effect - consider alternate routes');
        } else {
          recommendations.push('🌟 Weekend activity - expect more recreational users on trails');
        }
        break;
      case 'Drive':
        if (isWeekend) {
          recommendations.push('🅿️ Weekend parking may be limited at popular destinations');
        }
        break;
    }
  }

  private addWeatherTimeRecommendations(
    recommendations: string[],
    hour: number,
    weather: WeatherConditions,
    activityType: CoreActivityType
  ): void {
    // Dawn/Dusk considerations
    const isDawnOrDusk = (hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19);
    if (isDawnOrDusk && weather.visibility < 8) {
      recommendations.push('🌅 Limited visibility during dawn/dusk - extra caution advised');
    }

    // Activity-specific weather-time combinations
    if (activityType === 'Run' || activityType === 'Bike') {
      if (hour > 11 && hour < 15 && weather.temperature > 80) {
        recommendations.push('🌡️ Peak heat hours - consider hydration stations');
      }
    }
  }

  private addUserPreferenceTimings(
    recommendations: string[],
    userPrefs: UserPreferences,
    hour: number
  ): void {
    if (userPrefs.preferredTimes) {
      const isPreferredTime = userPrefs.preferredTimes.includes(hour.toString());
      if (!isPreferredTime) {
        recommendations.push('⏰ Outside your usual activity time - adjust expectations');
      }
    }
  }
} 