import { ServiceContainer } from '@/services/ServiceContainer';
import {
  CoreActivityType,
  ActivityContext,
  RoutePromptContext,
  PromptTemplate,
  BaseActivity
} from '@/types/activities';

import { DriveActivity } from './activities/DriveActivity';
import { BikeActivity } from './activities/BikeActivity';
import { RunActivity } from './activities/RunActivity';
import { SkiActivity } from './activities/SkiActivity';
import { AdventureActivity } from './activities/AdventureActivity';

export class ActivityPromptBuilder {
  private readonly BASE_SYSTEM_PROMPT = `You are Routopia's AI route planning assistant. For each activity type:

DRIVE:
- Optimize for traffic patterns and road conditions
- Consider parking availability and charging stations
- Include food and rest stop recommendations

BIKE:
- Account for elevation and trail conditions
- Consider rider skill level and bike type
- Include family-friendly options when specified
- Factor in weather impact on trail conditions

RUN:
- Focus on surface type and lighting conditions
- Consider safety and accessibility
- Account for elevation gain preferences
- Include water/rest stop availability

SKI:
- Monitor snow conditions and resort status
- Consider skill level and terrain preferences
- Include parking and lift access planning
- Factor in weather and avalanche risks

ADVENTURE:
- Combine multiple activities efficiently
- Optimize transitions between activities
- Consider gear storage/transport needs
- Include dining and photography opportunities
- Account for seasonal activity availability`;

  private activityHandlers: Map<CoreActivityType, BaseActivity>;
  private readonly services: ServiceContainer;

  constructor() {
    this.services = ServiceContainer.getInstance();
    
    // Fix the type issue with the Map constructor
    const handlers = [
      ['Drive', new DriveActivity()],
      ['Bike', new BikeActivity(this.services.getTrailService())],
      ['Run', new RunActivity(this.services.getTrailService())],
      ['Ski', new SkiActivity(this.services.getSkiService())],
      ['Adventure', new AdventureActivity(
        this.services.getTrailService(),
        this.services.getSkiService()
      )]
    ] as const;

    this.activityHandlers = new Map(handlers);
  }

  async buildPrompt(context: RoutePromptContext): Promise<PromptTemplate> {
    try {
      const handler = this.activityHandlers.get(context.activity.activityType);
      if (!handler) {
        throw new Error(`No handler found for activity type: ${context.activity.activityType}`);
      }

      const activityPrompt = await handler.getPrompt(context.activity);
      return {
        system: this.BASE_SYSTEM_PROMPT,
        user: activityPrompt,
        functions: this.getActivityFunctions(context.activity)
      };
    } catch (error) {
      console.error('Error building prompt:', error);
      throw error;
    }
  }

  private getActivityFunctions(activityType: CoreActivityType): OpenAIFunction[] {
    // We'll implement this in step 4
    return [];
  }
} 