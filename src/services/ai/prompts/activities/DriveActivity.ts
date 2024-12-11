import { BaseActivity } from './BaseActivity';
import { ActivityContext, RoutePromptContext } from '@/types/activities';

export class DriveActivity extends BaseActivity {
  getPrompt(context: ActivityContext): string {
    const basePrompt = `For this driving journey, consider:
- Current traffic conditions and optimal routing
- Weather impact on road conditions
- Strategic rest stops and points of interest
- Parking availability at destinations`;

    // Add sub-activity specific prompts
    if (context.subActivities?.type === 'foodie') {
      return `${basePrompt}
- Restaurant recommendations along the route
- Peak dining hours and reservation requirements
- Parking availability near dining locations`;
    }

    return basePrompt;
  }

  getFollowUpQuestions(): string[] {
    return [
      "Do you prefer highways or scenic routes?",
      "Would you like to include food or rest stops?",
      "Are there any specific areas you'd like to avoid?"
    ];
  }

  validateContext(context: RoutePromptContext): boolean {
    return (
      !!context.routeConstraints.startLocation &&
      !!context.environmentalFactors.weather &&
      !!context.userProfile.preferences
    );
  }
} 