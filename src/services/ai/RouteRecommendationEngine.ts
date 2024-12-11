import { OpenAIEmbeddings } from './OpenAIEmbeddings';
import { PineconeService } from '../search/PineconeService';
import { CombinedRoute } from '@/types/combinedRoute';
import { SearchOptions } from '@/types/search/vector';

export class RouteRecommendationEngine {
  constructor(
    private embeddings: OpenAIEmbeddings,
    private pineconeService: PineconeService
  ) {}

  async getRecommendations(
    userPreferences: SearchOptions,
    currentRoute?: CombinedRoute
  ): Promise<CombinedRoute[]> {
    // If we have a current route, use it as context
    if (currentRoute) {
      return this.getSimilarRoutes(currentRoute, userPreferences);
    }

    // Otherwise, use preferences to find matching routes
    return this.getPreferenceBasedRoutes(userPreferences);
  }

  private async getSimilarRoutes(
    route: CombinedRoute,
    preferences: SearchOptions
  ): Promise<CombinedRoute[]> {
    const description = this.generateRouteDescription(route);
    const embedding = await this.embeddings.embedText(description);

    // Search using both embedding and preferences
    const results = await this.pineconeService.searchSimilarRoutes(embedding, {
      ...preferences,
      filter: this.buildSearchFilter(preferences)
    });

    return results;
  }

  private generateRouteDescription(route: CombinedRoute): string {
    const parts = [
      `A ${route.type} route`,
      `with distance of ${route.metadata?.totalDistance}km`,
      route.metadata?.difficulty && `difficulty level ${route.metadata.difficulty}`,
      route.metadata?.terrain?.length && `terrain types: ${route.metadata.terrain.join(', ')}`,
    ];

    return parts.filter(Boolean).join(', ');
  }

  private buildSearchFilter(preferences: SearchOptions): Record<string, any> {
    const filter: Record<string, any> = {};

    if (preferences.activityType) {
      filter.activityType = preferences.activityType;
    }

    if (preferences.difficulty) {
      filter.difficulty = preferences.difficulty;
    }

    if (preferences.distance) {
      filter.distance = {
        $gte: preferences.distance.min || 0,
        $lte: preferences.distance.max || Infinity
      };
    }

    return filter;
  }

  private async getPreferenceBasedRoutes(
    preferences: SearchOptions
  ): Promise<CombinedRoute[]> {
    const description = this.generatePreferenceDescription(preferences);
    const embedding = await this.embeddings.embedText(description);

    return this.pineconeService.searchSimilarRoutes(embedding, {
      ...preferences,
      filter: this.buildSearchFilter(preferences)
    });
  }

  private generatePreferenceDescription(preferences: SearchOptions): string {
    const parts = [
      preferences.activityType && `A ${preferences.activityType} route`,
      preferences.difficulty && `with ${preferences.difficulty} difficulty`,
      preferences.distance && `distance between ${preferences.distance.min || 0}km and ${preferences.distance.max || 'any'}km`,
      preferences.terrain?.length && `terrain types: ${preferences.terrain.join(', ')}`
    ];

    return parts.filter(Boolean).join(', ');
  }
} 