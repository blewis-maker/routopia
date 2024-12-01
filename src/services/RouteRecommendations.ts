import type { 
  Route, 
  UserPreferences, 
  ActivityLevel, 
  RecommendationScore 
} from '@/types/routes';

export class RouteRecommendations {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private routeScores: Map<string, RecommendationScore> = new Map();

  async generateRecommendations(
    userId: string,
    activityLevel: ActivityLevel,
    count: number = 5
  ): Promise<Route[]> {
    const preferences = await this.getUserPreferences(userId);
    const routes = await this.getEligibleRoutes(preferences, activityLevel);
    
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.calculateRouteScore(route, preferences, activityLevel)
    }));

    return scoredRoutes
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ route }) => route);
  }

  private calculateRouteScore(
    route: Route,
    preferences: UserPreferences,
    activityLevel: ActivityLevel
  ): number {
    const difficultyMatch = this.calculateDifficultyMatch(
      route.difficulty,
      activityLevel
    );
    
    const preferenceMatch = this.calculatePreferenceMatch(
      route,
      preferences
    );
    
    const popularityScore = this.getRoutePopularity(route.id);
    
    return (
      difficultyMatch * 0.4 +
      preferenceMatch * 0.4 +
      popularityScore * 0.2
    );
  }

  private async updateUserPreferences(
    userId: string,
    routeId: string,
    interaction: 'complete' | 'like' | 'save'
  ): Promise<void> {
    const preferences = this.userPreferences.get(userId) || {};
    // Update preferences based on user interaction
    await this.persistUserPreferences(userId, preferences);
  }
} 