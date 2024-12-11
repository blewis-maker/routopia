import { BaseActivity } from './BaseActivity';
import { ActivityContext, RoutePromptContext, Trail } from '@/types/activities';
import { TrailAPIService } from '@/services/trail/TrailAPIService';
import { CombinedRoute } from '@/types/combinedRoute';
import { TrailRankingService } from '@/services/trail/TrailRankingService';

export class BikeActivity extends BaseActivity {
  private readonly rankingService: TrailRankingService;

  constructor(private readonly trailService: TrailAPIService) {
    super();
    this.rankingService = new TrailRankingService();
  }

  async getPrompt(context: ActivityContext): Promise<string> {
    try {
      const basePrompt = `For this cycling route, consider:
- Current trail and road conditions
- Elevation profile and difficulty level
- Weather impact on riding conditions
- Rest stops and water availability`;

      if (context.subActivities?.type === 'family') {
        return `${basePrompt}
- Family-friendly paths and trails
- Safe crossing points
- Frequent rest areas
- Avoid high-traffic areas`;
      }

      return basePrompt;
    } catch (error) {
      throw this.handleError(error, 'getPrompt');
    }
  }

  async suggestCombinedRoute(context: RoutePromptContext): Promise<CombinedRoute> {
    try {
      // Validate context first
      if (!this.validateContext(context)) {
        throw new Error('Invalid context for bike activity');
      }

      // Check weather warnings
      const warnings = this.validateWeatherConditions(context);
      if (warnings.length > 0) {
        console.warn('Weather warnings:', warnings);
      }

      // Get nearby trails
      const trails = await this.trailService.searchTrails({
        lat: context.routeConstraints.startLocation.lat,
        lng: context.routeConstraints.startLocation.lng,
        activity: 'bike',
        difficulty: [this.mapSkillLevel(context.userProfile.preferences.skill_level)]
      });

      if (trails.length === 0) {
        throw new Error('No suitable trails found in the area');
      }

      // Find best matching trail
      const bestTrail = this.findBestTrail(trails, context);

      return this.createCombinedRoute(bestTrail, context, warnings);
    } catch (error) {
      throw this.handleError(error, 'suggestCombinedRoute');
    }
  }

  private createCombinedRoute(
    trail: Trail, 
    context: RoutePromptContext,
    warnings: string[]
  ): CombinedRoute {
    return {
      segments: [
        {
          type: 'road',
          path: [], // Will be filled by Google Maps
          details: { 
            distance: 0, 
            duration: 0,
            color: '#4285F4'
          }
        },
        {
          type: 'trail',
          path: trail.coordinates,
          details: {
            distance: trail.length,
            difficulty: trail.difficulty,
            conditions: trail.conditions,
            color: '#34A853'
          }
        }
      ],
      waypoints: [
        {
          type: 'parking',
          location: trail.parking || trail.coordinates[0],
          name: `${trail.name} Parking`
        },
        {
          type: 'trailhead',
          location: trail.coordinates[0],
          name: trail.name
        }
      ],
      metadata: {
        totalDistance: trail.length,
        difficulty: trail.difficulty,
        recommendedGear: this.getRecommendedGear(trail, context),
        environmentalFactors: warnings
      }
    };
  }

  private findBestTrail(trails: Trail[], context: RoutePromptContext): Trail {
    const rankedTrails = this.rankingService.rankTrails(trails, {
      preferences: context.userProfile.preferences,
      weather: context.environmentalFactors.weather,
      timeOfDay: context.timeOfDay
    });

    return rankedTrails[0];
  }

  getFollowUpQuestions(): string[] {
    return [
      "What type of bike will you be riding? (road, mountain, hybrid)",
      "Are you comfortable with technical terrain?",
      "Do you have any elevation gain preferences?",
      "Would you like to include any scenic stops?"
    ];
  }

  validateContext(context: RoutePromptContext): boolean {
    return (
      !!context.routeConstraints.startLocation &&
      !!context.environmentalFactors.weather &&
      !!context.userProfile.preferences &&
      !context.environmentalFactors.weather.conditions.toLowerCase().includes('thunderstorm')
    );
  }

  private mapSkillLevel(skillLevel: string): string {
    const skillMap: Record<string, string> = {
      'beginner': 'easy',
      'intermediate': 'moderate',
      'advanced': 'difficult',
      'expert': 'expert'
    };
    return skillMap[skillLevel] || 'moderate';
  }

  private getRecommendedGear(trail: Trail, context: RoutePromptContext): string[] {
    const gear = ['Bike', 'Helmet', 'Water'];
    
    if (trail.difficulty === 'difficult' || trail.difficulty === 'expert') {
      gear.push('Protective Gear', 'First Aid Kit');
    }

    if (context.environmentalFactors.weather.conditions.toLowerCase().includes('rain')) {
      gear.push('Rain Gear', 'Lights');
    }

    return gear;
  }
} 