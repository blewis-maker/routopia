import * as Sentry from '@sentry/nextjs';

export class AIMonitoring {
  static logEmbeddingError(error: Error, context: Record<string, any>) {
    Sentry.captureException(error, {
      tags: { service: 'embeddings' },
      extra: context
    });
  }

  static logVectorSearchError(error: Error, context: Record<string, any>) {
    Sentry.captureException(error, {
      tags: { service: 'vector-search' },
      extra: context
    });
  }

  static logRouteRecommendationError(error: Error, context: Record<string, any>) {
    Sentry.captureException(error, {
      tags: { service: 'route-recommendation' },
      extra: context
    });
  }

  static trackSearchLatency(duration: number, queryType: string) {
    // Implement metrics tracking (e.g., with Datadog or custom solution)
  }
} 