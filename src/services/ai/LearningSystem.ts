import type { UserPreferences } from '@/types/ai/learning';
import type { RouteSegment } from '@/types/route/types';
import { AIService } from './AIService';
import { CrossActivityLearningService } from './CrossActivityLearningService';
import { ContextualLearningService } from './ContextualLearningService';
import { SocialLearningService } from './SocialLearningService';
import { ActivityType, ActivityMetrics } from '@/types/activity';
import { WeatherConditions } from '@/types/weather';
import { TerrainConditions } from '@/types/route/types';
import { SocialFactors } from '@/types/social';
import { GeoPoint } from '@/types/geo';
import logger from '@/utils/logger';
import type { LearningPattern, UserBehavior, RouteContext } from '@/types/ai/learning';

export class LearningSystem {
  private readonly aiService: AIService;
  private readonly behaviorCache: Map<string, UserBehavior[]>;
  private readonly patternCache: Map<string, LearningPattern[]>;
  private readonly crossActivityLearning: CrossActivityLearningService;
  private readonly contextualLearning: ContextualLearningService;
  private readonly socialLearning: SocialLearningService;

  constructor() {
    this.aiService = new AIService();
    this.behaviorCache = new Map();
    this.patternCache = new Map();
    this.crossActivityLearning = new CrossActivityLearningService();
    this.contextualLearning = new ContextualLearningService();
    this.socialLearning = new SocialLearningService();
  }

  async analyzeUserBehavior(
    userId: string,
    behavior: UserBehavior
  ): Promise<LearningPattern[]> {
    // Get existing behaviors
    const behaviors = this.getBehaviors(userId);
    behaviors.push(behavior);

    // Update cache
    this.behaviorCache.set(userId, behaviors);

    // Analyze patterns
    const patterns = await this.detectPatterns(behaviors);
    this.patternCache.set(userId, patterns);

    return patterns;
  }

  async generatePersonalizedSuggestions(
    userId: string,
    context: RouteContext
  ): Promise<RouteSuggestion[]> {
    const patterns = this.patternCache.get(userId) || [];
    const behaviors = this.behaviorCache.get(userId) || [];

    // Generate context-aware suggestions
    return this.aiService.generateSuggestions({
      patterns,
      behaviors,
      context,
      maxSuggestions: 5
    });
  }

  async updateLearningModel(
    userId: string,
    feedback: UserFeedback
  ): Promise<void> {
    const patterns = this.patternCache.get(userId) || [];
    
    // Adjust pattern weights based on feedback
    const updatedPatterns = patterns.map(pattern => ({
      ...pattern,
      confidence: this.adjustConfidence(pattern, feedback),
      relevance: this.calculateRelevance(pattern, feedback)
    }));

    this.patternCache.set(userId, updatedPatterns);
  }

  async predictUserPreferences(
    userId: string,
    context: RouteContext
  ): Promise<UserPreferences> {
    const patterns = this.patternCache.get(userId) || [];
    const behaviors = this.behaviorCache.get(userId) || [];

    return {
      routePreferences: await this.predictRoutePreferences(patterns, behaviors),
      activityPreferences: await this.predictActivityPreferences(patterns, behaviors),
      timePreferences: await this.predictTimePreferences(patterns, behaviors),
      environmentalPreferences: await this.predictEnvironmentalPreferences(patterns, behaviors)
    };
  }

  private async detectPatterns(
    behaviors: UserBehavior[]
  ): Promise<LearningPattern[]> {
    // Group behaviors by type
    const groupedBehaviors = this.groupBehaviors(behaviors);

    // Analyze each behavior type
    const patterns: LearningPattern[] = [];
    
    for (const [type, typeBehaviors] of groupedBehaviors) {
      patterns.push(
        ...(await this.analyzeTimePatterns(type, typeBehaviors)),
        ...(await this.analyzeLocationPatterns(type, typeBehaviors)),
        ...(await this.analyzePreferencePatterns(type, typeBehaviors)),
        ...(await this.analyzeContextPatterns(type, typeBehaviors))
      );
    }

    return this.filterSignificantPatterns(patterns);
  }

  private groupBehaviors(
    behaviors: UserBehavior[]
  ): Map<string, UserBehavior[]> {
    const grouped = new Map<string, UserBehavior[]>();

    behaviors.forEach(behavior => {
      const existing = grouped.get(behavior.type) || [];
      grouped.set(behavior.type, [...existing, behavior]);
    });

    return grouped;
  }

  private async analyzeTimePatterns(
    type: string,
    behaviors: UserBehavior[]
  ): Promise<LearningPattern[]> {
    return this.aiService.analyzeTimePatterns(behaviors);
  }

  private async analyzeLocationPatterns(
    type: string,
    behaviors: UserBehavior[]
  ): Promise<LearningPattern[]> {
    return this.aiService.analyzeLocationPatterns(behaviors);
  }

  private async analyzePreferencePatterns(
    type: string,
    behaviors: UserBehavior[]
  ): Promise<LearningPattern[]> {
    return this.aiService.analyzePreferencePatterns(behaviors);
  }

  private async analyzeContextPatterns(
    type: string,
    behaviors: UserBehavior[]
  ): Promise<LearningPattern[]> {
    return this.aiService.analyzeContextPatterns(behaviors);
  }

  private filterSignificantPatterns(
    patterns: LearningPattern[]
  ): LearningPattern[] {
    return patterns.filter(pattern => 
      pattern.confidence > 0.6 && pattern.relevance > 0.5
    );
  }

  private adjustConfidence(
    pattern: LearningPattern,
    feedback: UserFeedback
  ): number {
    const impact = this.calculateFeedbackImpact(feedback);
    return pattern.confidence * (1 + impact);
  }

  private calculateRelevance(
    pattern: LearningPattern,
    feedback: UserFeedback
  ): number {
    const recency = this.calculateRecency(feedback.timestamp);
    const accuracy = this.calculateAccuracy(pattern, feedback);
    return (recency + accuracy) / 2;
  }

  private calculateFeedbackImpact(feedback: UserFeedback): number {
    return feedback.positive ? 0.1 : -0.1;
  }

  private calculateRecency(timestamp: number): number {
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    return Math.max(0, 1 - age / maxAge);
  }

  private calculateAccuracy(
    pattern: LearningPattern,
    feedback: UserFeedback
  ): number {
    return feedback.accuracy || 0.5;
  }

  private async predictRoutePreferences(
    patterns: LearningPattern[],
    behaviors: UserBehavior[]
  ): Promise<RoutePreferences> {
    return this.aiService.predictRoutePreferences(patterns, behaviors);
  }

  private async predictActivityPreferences(
    patterns: LearningPattern[],
    behaviors: UserBehavior[]
  ): Promise<ActivityPreferences> {
    return this.aiService.predictActivityPreferences(patterns, behaviors);
  }

  private async predictTimePreferences(
    patterns: LearningPattern[],
    behaviors: UserBehavior[]
  ): Promise<TimePreferences> {
    return this.aiService.predictTimePreferences(patterns, behaviors);
  }

  private async predictEnvironmentalPreferences(
    patterns: LearningPattern[],
    behaviors: UserBehavior[]
  ): Promise<EnvironmentalPreferences> {
    return this.aiService.predictEnvironmentalPreferences(patterns, behaviors);
  }

  private getBehaviors(userId: string): UserBehavior[] {
    return this.behaviorCache.get(userId) || [];
  }

  async processActivityLearning(
    userId: string,
    activity: {
      type: ActivityType;
      metrics: ActivityMetrics;
      location: GeoPoint;
    },
    context: {
      weather: WeatherConditions;
      terrain: TerrainConditions;
      social: SocialFactors;
      groupDynamics?: {
        groupSize: number;
        experienceLevels: string[];
        preferences: Record<string, any>;
        interactions: {
          frequency: number;
          quality: number;
          coordination: number;
        };
      };
      communityTrends?: {
        popularActivities: Array<{
          type: ActivityType;
          popularity: number;
          growth: number;
        }>;
        timePatterns: Array<{
          timeSlot: string;
          activity: ActivityType;
          participation: number;
        }>;
        locationHotspots: Array<{
          location: GeoPoint;
          activity: ActivityType;
          popularity: number;
        }>;
      };
    }
  ): Promise<{
    patterns: LearningPattern[];
    recommendations: string[];
    adaptations: {
      crossActivity: any;
      contextual: any;
      social: any;
    };
  }> {
    try {
      // Process cross-activity learning
      const crossActivityResults = await this.crossActivityLearning.analyzeActivityPatterns(
        userId,
        [{
          type: activity.type,
          metrics: activity.metrics,
          weather: context.weather,
          social: context.social
        }]
      );

      // Process contextual learning
      const contextualResults = await this.contextualLearning.analyzeContextualPatterns(
        activity.location,
        {
          type: activity.type,
          metrics: activity.metrics
        },
        {
          weather: context.weather,
          seasonal: this.getSeasonalConditions(context.weather),
          terrain: context.terrain
        }
      );

      // Process social learning
      const socialResults = await this.socialLearning.analyzeSocialPatterns(
        userId,
        {
          type: activity.type,
          metrics: activity.metrics,
          social: context.social
        },
        context.groupDynamics || {
          groupSize: 1,
          experienceLevels: ['individual'],
          preferences: {},
          interactions: {
            frequency: 0,
            quality: 0,
            coordination: 0
          }
        },
        context.communityTrends || {
          popularActivities: [],
          timePatterns: [],
          locationHotspots: []
        }
      );

      // Combine all patterns
      const allPatterns = [
        ...Array.from(crossActivityResults.values()).flat(),
        ...contextualResults.seasonalPatterns,
        ...contextualResults.environmentalPatterns,
        ...socialResults.groupPatterns,
        ...socialResults.communityPatterns
      ];

      // Generate comprehensive recommendations
      const recommendations = [
        ...this.generateCrossActivityRecommendations(crossActivityResults),
        ...contextualResults.adaptationSuggestions,
        ...socialResults.socialRecommendations
      ];

      return {
        patterns: allPatterns,
        recommendations,
        adaptations: {
          crossActivity: this.generateCrossActivityAdaptations(crossActivityResults),
          contextual: this.generateContextualAdaptations(contextualResults),
          social: this.generateSocialAdaptations(socialResults)
        }
      };
    } catch (error) {
      logger.error('Failed to process activity learning:', error);
      throw error;
    }
  }

  private getSeasonalConditions(weather: WeatherConditions): any {
    // Implementation to derive seasonal conditions from weather
    return {
      season: this.determineSeason(weather),
      daylight: this.calculateDaylight(weather),
      seasonal: {
        foliage: this.determineFoliage(weather),
        snowCover: weather.temperature < 0,
        temperature: this.determineTemperatureCategory(weather)
      }
    };
  }

  private generateCrossActivityRecommendations(
    patterns: Map<ActivityType, LearningPattern[]>
  ): string[] {
    const recommendations: string[] = [];
    for (const [activityType, activityPatterns] of patterns) {
      const highConfidencePatterns = activityPatterns.filter(
        pattern => pattern.confidence > 0.7
      );
      if (highConfidencePatterns.length > 0) {
        recommendations.push(
          `Based on your ${activityType} performance, consider trying similar activities.`
        );
      }
    }
    return recommendations;
  }

  private generateCrossActivityAdaptations(
    patterns: Map<ActivityType, LearningPattern[]>
  ): any {
    // Implementation to generate cross-activity adaptations
    return {};
  }

  private generateContextualAdaptations(
    results: {
      seasonalPatterns: LearningPattern[];
      environmentalPatterns: LearningPattern[];
    }
  ): any {
    // Implementation to generate contextual adaptations
    return {};
  }

  private generateSocialAdaptations(
    results: {
      groupPatterns: LearningPattern[];
      communityPatterns: LearningPattern[];
    }
  ): any {
    // Implementation to generate social adaptations
    return {};
  }

  private determineSeason(weather: WeatherConditions): string {
    // Implementation to determine season
    return 'summer';
  }

  private calculateDaylight(weather: WeatherConditions): any {
    // Implementation to calculate daylight information
    return {};
  }

  private determineFoliage(weather: WeatherConditions): boolean {
    // Implementation to determine foliage status
    return true;
  }

  private determineTemperatureCategory(weather: WeatherConditions): string {
    if (weather.temperature < 5) return 'cold';
    if (weather.temperature < 15) return 'mild';
    if (weather.temperature < 25) return 'warm';
    return 'hot';
  }
} 