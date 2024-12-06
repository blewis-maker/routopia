import { ActivityType, ActivityMetrics } from '@/types/activity';
import { LearningPattern, UserBehavior } from '@/types/ai/learning';
import { WeatherConditions } from '@/types/weather';
import { SocialFactors } from '@/types/social';
import logger from '@/utils/logger';

export class CrossActivityLearningService {
  private readonly activityPatterns: Map<string, LearningPattern[]> = new Map();
  private readonly transferableSkills: Map<ActivityType, Set<ActivityType>> = new Map([
    ['WALK', new Set(['RUN', 'BIKE'])],
    ['RUN', new Set(['WALK', 'BIKE'])],
    ['BIKE', new Set(['WALK', 'RUN'])],
    ['SKI', new Set(['BIKE'])]
  ]);

  async analyzeActivityPatterns(
    userId: string,
    activities: Array<{
      type: ActivityType;
      metrics: ActivityMetrics;
      weather: WeatherConditions;
      social: SocialFactors;
    }>
  ): Promise<Map<ActivityType, LearningPattern[]>> {
    const patterns = new Map<ActivityType, LearningPattern[]>();

    try {
      // Analyze patterns for each activity type
      for (const activity of activities) {
        const activityPatterns = await this.extractPatterns(activity);
        patterns.set(activity.type, activityPatterns);

        // Store patterns for future reference
        this.activityPatterns.set(
          `${userId}_${activity.type}`,
          activityPatterns
        );
      }

      // Analyze cross-activity correlations
      const crossPatterns = this.analyzeCrossActivityPatterns(patterns);
      
      // Merge activity-specific and cross-activity patterns
      for (const [activityType, activityPatterns] of patterns) {
        const relevantCrossPatterns = crossPatterns.filter(
          pattern => pattern.relatedActivities.includes(activityType)
        );
        patterns.set(activityType, [...activityPatterns, ...relevantCrossPatterns]);
      }

      return patterns;
    } catch (error) {
      logger.error('Failed to analyze activity patterns:', error);
      throw error;
    }
  }

  private async extractPatterns(activity: {
    type: ActivityType;
    metrics: ActivityMetrics;
    weather: WeatherConditions;
    social: SocialFactors;
  }): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];

    // Performance patterns
    patterns.push({
      type: 'performance',
      confidence: this.calculateConfidence(activity.metrics),
      pattern: {
        intensity: activity.metrics.averageSpeed,
        duration: activity.metrics.duration,
        elevationGain: activity.metrics.elevationGain,
        difficulty: activity.metrics.difficulty
      }
    });

    // Weather preference patterns
    patterns.push({
      type: 'weather',
      confidence: this.calculateWeatherConfidence(activity.weather),
      pattern: {
        temperature: activity.weather.temperature,
        conditions: activity.weather.conditions,
        windSpeed: activity.weather.windSpeed,
        precipitation: activity.weather.precipitation
      }
    });

    // Social patterns
    patterns.push({
      type: 'social',
      confidence: this.calculateSocialConfidence(activity.social),
      pattern: {
        crowdLevel: activity.social.popularTimes,
        userRatings: activity.social.userRatings,
        communityEngagement: activity.social.recentActivity
      }
    });

    return patterns;
  }

  private analyzeCrossActivityPatterns(
    patterns: Map<ActivityType, LearningPattern[]>
  ): LearningPattern[] {
    const crossPatterns: LearningPattern[] = [];

    // Analyze correlations between transferable activities
    for (const [sourceActivity, targetActivities] of this.transferableSkills) {
      const sourcePatterns = patterns.get(sourceActivity);
      if (!sourcePatterns) continue;

      for (const targetActivity of targetActivities) {
        const targetPatterns = patterns.get(targetActivity);
        if (!targetPatterns) continue;

        const correlation = this.findPatternCorrelations(
          sourcePatterns,
          targetPatterns
        );

        if (correlation.confidence > 0.7) {
          crossPatterns.push({
            type: 'cross_activity',
            confidence: correlation.confidence,
            pattern: correlation.pattern,
            relatedActivities: [sourceActivity, targetActivity]
          });
        }
      }
    }

    return crossPatterns;
  }

  async transferLearning(
    sourceActivity: ActivityType,
    targetActivity: ActivityType,
    userBehavior: UserBehavior
  ): Promise<{
    transferredPatterns: LearningPattern[];
    adaptationSuggestions: string[];
  }> {
    if (!this.transferableSkills.get(sourceActivity)?.has(targetActivity)) {
      return {
        transferredPatterns: [],
        adaptationSuggestions: []
      };
    }

    const sourcePatterns = await this.getActivityPatterns(
      userBehavior.userId,
      sourceActivity
    );

    const transferredPatterns = sourcePatterns.map(pattern => ({
      ...pattern,
      confidence: pattern.confidence * 0.8, // Reduce confidence for transferred patterns
      adaptationFactor: this.calculateAdaptationFactor(
        sourceActivity,
        targetActivity,
        pattern
      )
    }));

    return {
      transferredPatterns,
      adaptationSuggestions: this.generateAdaptationSuggestions(
        transferredPatterns,
        targetActivity
      )
    };
  }

  private calculateConfidence(metrics: ActivityMetrics): number {
    // Implementation of confidence calculation based on metrics consistency
    return 0.8; // Placeholder
  }

  private calculateWeatherConfidence(weather: WeatherConditions): number {
    // Implementation of weather pattern confidence calculation
    return 0.7; // Placeholder
  }

  private calculateSocialConfidence(social: SocialFactors): number {
    // Implementation of social pattern confidence calculation
    return 0.75; // Placeholder
  }

  private findPatternCorrelations(
    sourcePatterns: LearningPattern[],
    targetPatterns: LearningPattern[]
  ): {
    confidence: number;
    pattern: any;
  } {
    // Implementation of pattern correlation analysis
    return {
      confidence: 0.8,
      pattern: {}
    }; // Placeholder
  }

  private calculateAdaptationFactor(
    sourceActivity: ActivityType,
    targetActivity: ActivityType,
    pattern: LearningPattern
  ): number {
    // Implementation of adaptation factor calculation
    return 0.9; // Placeholder
  }

  private generateAdaptationSuggestions(
    patterns: LearningPattern[],
    targetActivity: ActivityType
  ): string[] {
    // Implementation of adaptation suggestions generation
    return []; // Placeholder
  }

  private async getActivityPatterns(
    userId: string,
    activityType: ActivityType
  ): Promise<LearningPattern[]> {
    return this.activityPatterns.get(`${userId}_${activityType}`) || [];
  }
} 