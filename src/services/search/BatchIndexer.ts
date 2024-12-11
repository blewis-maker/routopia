import { CombinedRoute } from '@/types/combinedRoute';
import { PineconeService } from './PineconeService';
import { RouteDescriptionGenerator } from '@/services/ai/RouteDescriptionGenerator';

export class BatchIndexer {
  constructor(
    private pineconeService: PineconeService,
    private descriptionGenerator: RouteDescriptionGenerator
  ) {}

  async indexRoutes(routes: CombinedRoute[], batchSize = 10) {
    const results = {
      total: routes.length,
      successful: 0,
      failed: 0,
      errors: [] as { routeId: string; error: string }[]
    };

    // Process routes in batches
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(routes.length / batchSize)}`);

      await Promise.all(
        batch.map(async (route) => {
          try {
            // Generate description
            const description = await this.descriptionGenerator.generateDescription(route);
            
            // Index route
            await this.pineconeService.indexRoute(route, description);
            
            results.successful++;
            console.log(`Successfully indexed route: ${route.id}`);
          } catch (error) {
            results.failed++;
            results.errors.push({
              routeId: route.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`Failed to index route ${route.id}:`, error);
          }
        })
      );

      // Add delay between batches to avoid rate limits
      if (i + batchSize < routes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  async reindexFailedRoutes(routes: CombinedRoute[], previousResults: { routeId: string; error: string }[]) {
    const failedRoutes = routes.filter(route => 
      previousResults.some(result => result.routeId === route.id)
    );

    if (failedRoutes.length === 0) {
      return { message: 'No failed routes to reindex' };
    }

    console.log(`Attempting to reindex ${failedRoutes.length} failed routes...`);
    return this.indexRoutes(failedRoutes, 5); // Smaller batch size for retries
  }

  async validateIndex(routes: CombinedRoute[]) {
    const results = {
      total: routes.length,
      indexed: 0,
      missing: [] as string[],
      mismatched: [] as { routeId: string; issue: string }[]
    };

    for (const route of routes) {
      try {
        const searchResult = await this.pineconeService.searchSimilarRoutes(
          route.id,
          { routeId: route.id }
        );

        if (searchResult.length === 0) {
          results.missing.push(route.id);
          continue;
        }

        // Verify metadata matches
        const indexedRoute = searchResult[0];
        if (indexedRoute.metadata) {
          // Add validation logic here when we have routes
          results.indexed++;
        }
      } catch (error) {
        console.error(`Error validating route ${route.id}:`, error);
      }
    }

    return results;
  }
} 