import type { 
  UserPreferences, 
  ActivityPattern,
  RouteHistory,
  LearningMetrics 
} from '@/types/preferences';

export class PreferenceLearning {
  private historyAnalyzer: HistoryAnalyzer;
  private patternRecognizer: PatternRecognizer;
  private preferenceOptimizer: PreferenceOptimizer;

  async analyzeUserPreferences(
    userId: string,
    history: RouteHistory
  ): Promise<LearningResults> {
    const patterns = await this.patternRecognizer.analyzePatterns(history);
    const preferences = await this.extractPreferences(patterns);

    return {
      learnedPreferences: this.optimizePreferences(preferences),
      activityPatterns: this.categorizePatterns(patterns),
      routeRecommendations: this.generateRecommendations(preferences),
      adaptiveSettings: this.createAdaptiveSettings(preferences)
    };
  }

  private async extractPreferences(
    patterns: ActivityPattern[]
  ): Promise<UserPreferences> {
    return {
      preferredActivities: this.identifyPreferredActivities(patterns),
      routeCharacteristics: this.analyzeRoutePreferences(patterns),
      timePreferences: this.analyzeTimePatterns(patterns),
      environmentalPreferences: this.analyzeEnvironmentalPreferences(patterns)
    };
  }

  private optimizePreferences(
    preferences: UserPreferences
  ): OptimizedPreferences {
    return this.preferenceOptimizer.optimize(preferences);
  }
} 