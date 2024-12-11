// src/services/ai/prompts/routePromptBuilder.ts

import { 
  RouteType, UserPreferences, WeatherConditions,
  TrafficConditions, LocalEvent, LatLng 
} from '@/types';

// Scenario-specific types
interface RoadTripScenario {
  type: 'ROAD_TRIP';
  parameters: {
    duration: string;
    maxDailyDrive: string;
    accommodationPreferences: string[];
    activities: string[];
    photographyInterests?: string[];
  };
}

interface RunningScenario {
  type: 'RUNNING';
  parameters: {
    distance: string;
    pace: string;
    surfacePreferences: string[];
    timeOfDay: string;
    safetyRequirements: string[];
  };
}

interface SkiScenario {
  type: 'SKI';
  parameters: {
    resort: string;
    skillLevel: string;
    preferredTerrain: string[];
    timeConstraints: {
      arrivalTime: string;
      departureTime?: string;
    };
  };
}

interface FoodieScenario {
  type: 'FOODIE';
  parameters: {
    cuisineTypes: string[];
    photoOpportunities: boolean;
    timingPreferences: {
      goldenHour: boolean;
      mealTimes: string[];
    };
    dietaryRestrictions?: string[];
  };
}

interface CorporateWellnessScenario {
  type: 'CORPORATE_WELLNESS';
  parameters: {
    teamSize: number;
    activityTypes: string[];
    duration: string;
    challengeType: 'individual' | 'team' | 'hybrid';
    integrations: string[];
  };
}

interface FamilyBikingScenario {
  type: 'FAMILY_BIKING';
  parameters: {
    childrenAges: number[];
    maxDuration: string;
    difficultyLevel: string;
    requiredFacilities: string[];
    safetyFeatures: string[];
  };
}

type RouteScenario = 
  | RoadTripScenario 
  | RunningScenario 
  | SkiScenario 
  | FoodieScenario 
  | CorporateWellnessScenario 
  | FamilyBikingScenario;

interface RoutePromptContext {
  scenario: RouteScenario;
  userProfile: {
    activityPreferences: string[];
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
    routeType: RouteType;
    maxDistance?: number;
    avoidances?: string[];
  };
}

class RoutePromptBuilder {
  private readonly BASE_SYSTEM_PROMPT = `You are Routopia's AI route planning assistant, specializing in creating personalized route experiences in the Boulder/Denver area. Your knowledge includes:

- Detailed local geography and trail systems
- Real-time weather and traffic patterns
- Local events and seasonal activities
- Historical usage patterns and user preferences
- Venue operating hours and peak times
- Safety considerations and emergency access points

Before generating routes, ask 2-3 specific questions focused on:
1. Critical preferences or constraints for this specific activity
2. Time-sensitive factors (weather windows, crowd patterns, etc.)
3. Experience-enhancing opportunities (photo spots, rest stops, etc.)

Provide responses in structured JSON matching the specified interface.`;

  constructor(
    private readonly weatherService: WeatherService,
    private readonly trafficService: TrafficService,
    private readonly eventService: EventService,
    private readonly venueService: VenueService
  ) {}

  async buildScenarioPrompt(context: RoutePromptContext): Promise<PromptTemplate> {
    const enrichedContext = await this.enrichContext(context);
    const scenarioSpecificPrompt = this.getScenarioPrompt(context.scenario);
    
    return {
      system: `${this.BASE_SYSTEM_PROMPT}\n\n${scenarioSpecificPrompt}`,
      user: this.buildUserPrompt(enrichedContext),
      functions: this.getScenarioFunctions(context.scenario)
    };
  }

  private getScenarioPrompt(scenario: RouteScenario): string {
    switch (scenario.type) {
      case 'ROAD_TRIP':
        return this.buildRoadTripPrompt(scenario);
      case 'RUNNING':
        return this.buildRunningPrompt(scenario);
      case 'SKI':
        return this.buildSkiPrompt(scenario);
      case 'FOODIE':
        return this.buildFoodiePrompt(scenario);
      case 'CORPORATE_WELLNESS':
        return this.buildCorporateWellnessPrompt(scenario);
      case 'FAMILY_BIKING':
        return this.buildFamilyBikingPrompt(scenario);
      default:
        throw new Error(`Unsupported scenario type: ${scenario['type']}`);
    }
  }

  private buildRoadTripPrompt(scenario: RoadTripScenario): string {
    return `For road trip planning, consider:
- Optimal driving times based on traffic patterns
- Scenic routes and photography opportunities
- Strategic rest stops and points of interest
- Accommodation availability and ratings
- Weather impacts on driving conditions
- Local events along the route

Ask about:
1. Preferred driving hours (early morning, daytime, evening)
2. Priority for scenic routes vs. fastest route
3. Types of stops (cultural, natural, urban)`;
  }

  private buildSkiPrompt(scenario: SkiScenario): string {
    return `For ski route planning, consider:
- Snow conditions and weather patterns
- Lift opening sequences
- Historical crowd patterns
- Parking lot fill rates
- Trail difficulty progression
- Sun exposure throughout the day

Ask about:
1. Preferred terrain type (groomed, moguls, back bowls)
2. Risk tolerance for variable conditions
3. Importance of avoiding crowds vs. optimal snow`;
  }

  private buildFoodiePrompt(scenario: FoodieScenario): string {
    return `For food photography tours, consider:
- Golden hour timing at each location
- Restaurant peak hours and quiet periods
- Special menu items and presentation
- Photo-worthy interior and exterior spaces
- Chef availability for interaction
- Natural lighting conditions

Ask about:
1. Preferred cuisine variety vs. theme consistency
2. Priority of ambiance vs. food presentation
3. Interest in behind-the-scenes access`;
  }

  private getScenarioFunctions(scenario: RouteScenario): OpenAIFunction[] {
    const baseFunctions = [{
      name: 'generateRoutePlan',
      description: 'Generate a detailed route plan based on scenario requirements',
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
                    start: { type: 'string' },
                    end: { type: 'string' },
                    distance: { type: 'number' },
                    duration: { type: 'number' },
                    terrain: { type: 'string' },
                    difficulty: { type: 'string' },
                    weatherConsiderations: { 
                      type: 'array', 
                      items: { type: 'string' } 
                    }
                  }
                }
              },
              optimizations: {
                type: 'object',
                properties: {
                  weather: { type: 'array', items: { type: 'string' } },
                  traffic: { type: 'array', items: { type: 'string' } },
                  timing: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    }];

    // Add scenario-specific function parameters
    switch (scenario.type) {
      case 'ROAD_TRIP':
        return [...baseFunctions, {
          name: 'suggestAccommodations',
          parameters: {
            type: 'object',
            properties: {
              stays: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    location: { type: 'string' },
                    type: { type: 'string' },
                    price: { type: 'string' },
                    features: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        }];
      
      case 'SKI':
        return [...baseFunctions, {
          name: 'generateLiftStrategy',
          parameters: {
            type: 'object',
            properties: {
              schedule: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    time: { type: 'string' },
                    lift: { type: 'string' },
                    runs: { type: 'array', items: { type: 'string' } },
                    conditions: { type: 'string' }
                  }
                }
              }
            }
          }
        }];
      
      // Add other scenario-specific functions...
      
      default:
        return baseFunctions;
    }
  }

  // Example usage:
  const promptBuilder = new RoutePromptBuilder(
    new WeatherService(),
    new TrafficService(),
    new EventService(),
    new VenueService()
  );

  // Road Trip Scenario
  const roadTripPrompt = await promptBuilder.buildScenarioPrompt({
    scenario: {
      type: 'ROAD_TRIP',
      parameters: {
        duration: '5 days',
        maxDailyDrive: '6 hours',
        accommodationPreferences: ['boutique hotels', 'unique stays'],
        activities: ['hiking', 'photography', 'local cuisine']
      }
    },
    userProfile: {
      activityPreferences: ['photography', 'hiking'],
      skillLevel: 'intermediate'
    },
    environmentalFactors: {
      weather: await weatherService.getForecast(),
      traffic: await trafficService.getConditions()
    },
    routeConstraints: {
      startLocation: { lat: 40.0150, lng: -105.2705 }, // Boulder
      endLocation: { lat: 38.5733, lng: -109.5498 }, // Moab
      routeType: 'CAR'
    }
  });

  // Ski Day Scenario
  const skiPrompt = await promptBuilder.buildScenarioPrompt({
    scenario: {
      type: 'SKI',
      parameters: {
        resort: 'Vail',
        skillLevel: 'advanced',
        preferredTerrain: ['back bowls', 'glades'],
        timeConstraints: {
          arrivalTime: '8:00 AM'
        }
      }
    },
    userProfile: {
      activityPreferences: ['powder skiing', 'tree runs'],
      skillLevel: 'advanced'
    },
    environmentalFactors: {
      weather: await weatherService.getForecast(),
      traffic: await trafficService.getConditions()
    },
    routeConstraints: {
      startLocation: { lat: 39.7392, lng: -104.9903 }, // Denver
      endLocation: { lat: 39.6433, lng: -106.3781 }, // Vail
      routeType: 'CAR'
    }
  });
}
