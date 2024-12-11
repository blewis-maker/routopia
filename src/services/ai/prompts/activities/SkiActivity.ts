import { BaseActivity } from './BaseActivity';
import { ActivityContext, RoutePromptContext } from '@/types/activities';
import { SkiAPIService } from '@/services/ski/SkiAPIService';
import { CombinedRoute } from '@/types/combinedRoute';

export class SkiActivity extends BaseActivity {
  constructor(private readonly skiService: SkiAPIService) {
    super();
  }

  async getPrompt(context: ActivityContext): Promise<string> {
    const basePrompt = `For this skiing journey, consider:
- Current snow conditions and resort status
- Weather impact on skiing conditions
- Lift access and parking availability
- Equipment rental options
- Safety considerations`;

    if (context.subActivities?.type === 'family') {
      return `${basePrompt}
- Family-friendly slopes and areas
- Ski school availability
- Child-specific facilities
- Easy access to lodges`;
    }

    return basePrompt;
  }

  getFollowUpQuestions(): string[] {
    return [
      "What's your skiing ability level?",
      "Do you need equipment rental?",
      "Are you interested in ski lessons?",
      "Do you prefer groomed runs or powder?"
    ];
  }

  validateContext(context: RoutePromptContext): boolean {
    return (
      !!context.routeConstraints.startLocation &&
      !!context.environmentalFactors.weather &&
      !!context.userProfile.preferences &&
      context.environmentalFactors.weather.temperature < 45
    );
  }
} 