import type { ChallengeType, RouteMetrics, UserPreferences } from '@/types/challenges';

export class EnhancedChallengeTypes {
  async generateDynamicChallenges(
    userPreferences: UserPreferences,
    routeMetrics: RouteMetrics
  ): Promise<Challenge[]> {
    const challenges: Challenge[] = [];

    // Progression-based challenges
    if (this.isEligibleForProgression(routeMetrics)) {
      challenges.push({
        type: 'progression',
        title: 'Level Up Your Route',
        requirements: {
          distance: routeMetrics.averageDistance * 1.2,
          elevation: routeMetrics.averageElevation * 1.15,
          duration: this.calculateTargetDuration(routeMetrics)
        }
      });
    }

    // Community-driven challenges
    if (userPreferences.socialFeatures) {
      challenges.push({
        type: 'community',
        title: 'Group Adventure',
        requirements: {
          minParticipants: 3,
          routeType: userPreferences.preferredRouteTypes,
          completionWindow: '48h'
        }
      });
    }

    // Exploration challenges
    challenges.push({
      type: 'exploration',
      title: 'Discover New Paths',
      requirements: {
        newRoutePercentage: 0.7,
        minPOIVisits: 3,
        uniqueAreaCoverage: true
      }
    });

    return this.prioritizeChallenges(challenges, userPreferences);
  }

  private calculateTargetDuration(metrics: RouteMetrics): number {
    // Intelligent duration calculation based on user history
    return metrics.averageDuration * this.getProgressionFactor(metrics);
  }
} 