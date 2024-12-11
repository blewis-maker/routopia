import { WeatherService } from '@/services/interfaces';
import { WeatherConditions, ActivityContext } from '@/types/activities';
import { UserPreferences } from '@/types/user';

export class ChatResponseEnricher {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly userActivityService: UserActivityService
  ) {}

  async enrichResponse(
    baseResponse: string,
    context: {
      weather: WeatherConditions;
      activity: ActivityContext;
      userPreferences?: UserPreferences;
    }
  ): Promise<string> {
    const weatherAdvice = this.getWeatherAdvice(context.weather, context.activity);
    const timeAdvice = this.getTimeBasedAdvice(context.activity);
    const userAdvice = context.userPreferences 
      ? this.getUserPreferenceAdvice(context.userPreferences, context.activity)
      : '';

    return `${baseResponse}

Weather Considerations:
${weatherAdvice.join('\n')}

Timing Advice:
${timeAdvice.join('\n')}

${userAdvice ? `Personal Recommendations:\n${userAdvice}` : ''}`;
  }

  private getWeatherAdvice(weather: WeatherConditions, activity: ActivityContext): string[] {
    const advice: string[] = [];
    const { temperature, conditions, windSpeed } = weather;

    // Universal weather advice
    if (temperature > 85) {
      advice.push('🌡️ High temperature alert - bring extra water and plan for breaks');
    } else if (temperature < 32) {
      advice.push('❄️ Cold conditions - dress in layers and watch for ice');
    }

    // Activity-specific weather advice
    switch (activity.activityType) {
      case 'Bike':
        if (windSpeed > 15) {
          advice.push('💨 Strong winds expected - consider adjusting your route');
        }
        break;
      case 'Run':
        if (conditions.toLowerCase().includes('rain')) {
          advice.push('🌧️ Wet conditions - stick to paved surfaces and wear visible clothing');
        }
        break;
      // ... other activities
    }

    return advice;
  }

  private getTimeBasedAdvice(activity: ActivityContext): string[] {
    const hour = new Date().getHours();
    const advice: string[] = [];

    // Universal time advice
    if (hour < 6 || hour > 20) {
      advice.push('🌙 Limited daylight - bring reflective gear and lights');
    }

    // Activity-specific time advice
    switch (activity.activityType) {
      case 'Run':
        if (hour > 11 && hour < 15) {
          advice.push('☀️ Peak sun hours - consider shaded routes');
        }
        break;
      case 'Bike':
        if (hour > 16 && hour < 19) {
          advice.push('🚗 Rush hour traffic - consider alternative routes');
        }
        break;
    }

    return advice;
  }

  private getUserPreferenceAdvice(prefs: UserPreferences, activity: ActivityContext): string {
    const advice: string[] = [];

    if (prefs.maxDistance && activity.activityType !== 'Drive') {
      advice.push(`📏 Route within your preferred ${prefs.maxDistance}km range`);
    }

    if (prefs.weatherPrefs?.avoidRain && activity.activityType !== 'Drive') {
      advice.push('☔ Indoor alternatives available if weather worsens');
    }

    return advice.join('\n');
  }
} 