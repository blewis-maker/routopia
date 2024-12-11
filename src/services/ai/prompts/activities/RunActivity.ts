import { BaseActivity } from './BaseActivity';
import { ActivityContext, RoutePromptContext } from '@/types/activities';

export class RunActivity extends BaseActivity {
  getPrompt(context: ActivityContext): string {
    const basePrompt = `For this running route, consider:
- Surface type and terrain quality
- Lighting conditions and visibility
- Safety and accessibility
- Water fountain availability
- Restroom access points
- Current weather impact`;

    if (context.subActivities?.type === 'training') {
      return `${basePrompt}
- Interval-friendly segments
- Hill training opportunities
- Track or measured segments
- Recovery zones
- Performance tracking areas`;
    }

    if (context.subActivities?.type === 'photography') {
      return `${basePrompt}
- Scenic viewpoints
- Natural landmarks
- Sunrise/sunset opportunities
- Photography rest stops
- Interesting urban features`;
    }

    return basePrompt;
  }

  getFollowUpQuestions(): string[] {
    return [
      "What's your preferred running surface? (trail, road, mixed)",
      "Do you need regular water stops?",
      "Are you training for any specific event or goal?",
      "Do you prefer loops or out-and-back routes?"
    ];
  }

  validateContext(context: RoutePromptContext): boolean {
    return (
      !!context.routeConstraints.startLocation &&
      !!context.environmentalFactors.weather &&
      !!context.userProfile.preferences &&
      context.environmentalFactors.weather.temperature < 95 // No running in extreme heat
    );
  }
} 