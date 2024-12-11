import { BaseActivity } from './BaseActivity';
import { ActivityContext, RoutePromptContext } from '@/types/activities';

export class AdventureActivity extends BaseActivity {
  getPrompt(context: ActivityContext): string {
    const basePrompt = `For this adventure route, consider:
- Multiple activity transitions
- Gear storage and logistics
- Weather impact on each segment
- Safety and backup plans
- Time management between activities
- Transportation between segments`;

    if (context.subActivities?.type === 'photography') {
      return `${basePrompt}
- Best photo opportunities
- Golden/blue hour timing
- Camera gear logistics
- Safe storage locations
- Unique vantage points`;
    }

    if (context.subActivities?.type === 'foodie') {
      return `${basePrompt}
- Local cuisine highlights
- Restaurant timing/reservations
- Food photography spots
- Picnic locations
- Food storage considerations`;
    }

    return basePrompt;
  }

  getFollowUpQuestions(): string[] {
    return [
      "Which activities would you like to combine?",
      "Do you need gear storage or transport?",
      "What's your preferred activity order?",
      "Are there specific highlights you want to include?"
    ];
  }

  validateContext(context: RoutePromptContext): boolean {
    return (
      !!context.routeConstraints.startLocation &&
      !!context.environmentalFactors.weather &&
      !!context.userProfile.preferences &&
      // Check daylight hours for complex adventures
      new Date().getHours() < 18
    );
  }
} 