import { ActivityContext, RoutePromptContext } from '@/types/activities';

export abstract class BaseActivity {
  abstract getPrompt(context: ActivityContext): Promise<string> | string;
  abstract getFollowUpQuestions(): string[];
  abstract validateContext(context: RoutePromptContext): boolean;

  protected handleError(error: unknown, operation: string): Error {
    console.error(`Error in ${operation}:`, error);
    if (error instanceof Error) {
      return new Error(`Activity error: ${error.message}`);
    }
    return new Error(`Unexpected error in ${operation}`);
  }

  protected validateWeatherConditions(context: RoutePromptContext): string[] {
    const warnings: string[] = [];
    const { weather } = context.environmentalFactors;

    if (weather.temperature > 95) {
      warnings.push('Extreme heat warning - activity not recommended');
    }
    if (weather.temperature < 32) {
      warnings.push('Freezing conditions - use extreme caution');
    }
    if (weather.visibility < 5) {
      warnings.push('Low visibility conditions');
    }
    if (weather.windSpeed > 25) {
      warnings.push('High wind warning');
    }

    return warnings;
  }
} 