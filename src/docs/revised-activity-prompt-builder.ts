// src/services/ai/prompts/ActivityPromptBuilder.ts

import { 
  ActivityType,
  UserPreferences,
  WeatherConditions,
  TrafficConditions,
  LocalEvent,
  LatLng 
} from '@/types';

// Core activity types matching UI
type CoreActivityType = 'Drive' | 'Bike' | 'Run' | 'Ski' | 'Adventure';

interface ActivityContext {
  activityType: CoreActivityType;
  subActivities?: {
    type: 'foodie' | 'family' | 'training' | 'photography';
    parameters: SubActivityParameters;
  };
  transitMode?: 'car' | 'public_transit' | 'self_powered';
}

interface RoutePromptContext {
  activity: ActivityContext;
  userProfile: {
    preferences: UserPreferences;
    skillLevel: string;
    timeConstraints?: {
      startTime?: string;
      endTime?: string;
      duration?: string;
    };
  };
  environmentalFactors: {
    weather: WeatherConditions;
    traffic?: TrafficConditions;
    localEvents?: LocalEvent[];
  };
  routeConstraints: {
    startLocation: LatLng;
    endLocation?: LatLng;
    waypoints?: LatLng[];
    maxDistance?: number;
    avoidances?: string[];
  };
}

class ActivityPromptBuilder {
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
- Account for seasonal activity availability

Before generating routes, ask 2-3 specific questions about:
1. Key preferences or constraints for the chosen activity
2. Important timing and logistics considerations
3. Special requirements or interests (photography, dining, etc.)`;

  constructor(
    private readonly weatherService: WeatherService,
    private readonly trafficService: TrafficService,
    private readonly eventService: EventService,
    private readonly venueService: VenueService,
    private readonly trailService: TrailService
  ) {}

  async buildPrompt(context: RoutePromptContext): Promise<PromptTemplate> {
    const enrichedContext = await this.enrichContext(context);
    const activityPrompt = this.getActivityPrompt(context.activity);
    
    return {
      system: `${this.BASE_SYSTEM_PROMPT}\n\n${activityPrompt}`,
      user: this.buildUserPrompt(enrichedContext),
      functions: this.getActivityFunctions(context.activity)
    };
  }

  private getActivityPrompt(activity: ActivityContext): string {
    const basePrompt = this.getBaseActivityPrompt(activity.activityType);
    const subActivityPrompt = activity.subActivities ? 
      this.getSubActivityPrompt(activity.subActivities) : '';
    const transitPrompt = activity.transitMode ? 
      this.getTransitPrompt(activity.transitMode) : '';

    return `${basePrompt}\n${subActivityPrompt}\n${transitPrompt}`.trim();
  }

  private getBaseActivityPrompt(activityType: CoreActivityType): string {
    switch (activityType) {
      case 'Adventure':
        return `For this multi-activity adventure, consider:
- Optimal sequencing of activities
- Gear storage and transitions
- Weather impact on each activity
- Photography and dining opportunities
- Rest and recovery periods
- Parking and access points`;

      case 'Drive':
        return `For this driving journey, consider:
- Traffic patterns and road conditions
- Scenic route opportunities
- Strategic rest and dining stops
- Parking availability at destinations
- Weather impact on driving conditions
- Local events and attractions`;

      case 'Bike':
        return `For this cycling route, consider:
- Trail conditions and difficulty
- Elevation profile and technical sections
- Weather impact on riding conditions
- Rest stops and water availability
- Emergency access points
- Family-friendly features when needed`;

      // Add other activity types...
    }
  }

  private getSubActivityPrompt(subActivity: ActivityContext['subActivities']): string {
    if (!subActivity) return '';

    switch (subActivity.type) {
      case 'foodie':
        return `\nIncorporate dining experiences:
- Restaurant operating hours
- Cuisine specialties
- Photography opportunities
- Parking availability
- Peak dining times`;

      case 'family':
        return `\nOptimize for family needs:
- Safety considerations
- Rest facilities
- Bailout options
- Kid-friendly features
- Emergency access`;

      // Add other sub-activity types...
    }
  }

  private getActivityFunctions(activity: ActivityContext): OpenAIFunction[] {
    const baseFunctions = [{
      name: 'generateRoutePlan',
      description: 'Generate a detailed route plan based on activity requirements',
      parameters: {
        type: 'object',
        properties: {
          route: {
            type: 'object',
            properties: {
              segments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    activity: { type: 'string' },
                    start: { type: 'string' },
                    end: { type: 'string' },
                    distance: { type: 'number' },
                    duration: { type: 'number' },
                    difficulty: { type: 'string' },
                    features: { 
                      type: 'array', 
                      items: { type: 'string' } 
                    },
                    considerations: {
                      type: 'object',
                      properties: {
                        weather: { type: 'array', items: { type: 'string' } },
                        safety: { type: 'array', items: { type: 'string' } },
                        logistics: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  }
                }
              },
              waypoints: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    location: { type: 'string' },
                    duration: { type: 'number' },
                    features: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }];

    // Add activity-specific functions based on type
    if (activity.activityType === 'Adventure') {
      baseFunctions.push({
        name: 'generateTransitionPlan',
        parameters: {
          type: 'object',
          properties: {
            transitions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  to: { type: 'string' },
                  location: { type: 'string' },
                  duration: { type: 'number' },
                  requirements: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });
    }

    return baseFunctions;
  }
}

// Example usage:
const promptBuilder = new ActivityPromptBuilder(
  new WeatherService(),
  new TrafficService(),
  new EventService(),
  new VenueService(),
  new TrailService()
);

// Adventure mode with foodie integration
const adventurePrompt = await promptBuilder.buildPrompt({
  activity: {
    activityType: 'Adventure',
    subActivities: {
      type: 'foodie',
      parameters: {
        cuisineTypes: ['local', 'farm-to-table'],
        photoOpportunities: true
      }
    },
    transitMode: 'car'
  },
  userProfile: {
    preferences: {
      preferred_activities: ['hiking', 'photography'],
      cuisine_preferences: ['local', 'healthy'],
      skill_level: 'intermediate'
    },
    skillLevel: 'intermediate'
  },
  environmentalFactors: {
    weather: await weatherService.getForecast(),
    traffic: await trafficService.getConditions(),
    localEvents: await eventService.getUpcomingEvents()
  },
  routeConstraints: {
    startLocation: { lat: 40.0150, lng: -105.2705 }, // Boulder
    maxDistance: 50 // miles
  }
});
