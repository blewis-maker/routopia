import type { 
  ActivityType, 
  ActivityMetrics, 
  PopularityScore 
} from '@/types/activities';

export class ActivityAnalytics {
  private activities: Map<ActivityType, ActivityMetrics> = new Map();

  async trackActivity(type: ActivityType, data: any): Promise<void> {
    const metrics = this.activities.get(type) || this.initializeMetrics(type);
    
    metrics.totalCount++;
    metrics.lastUpdated = new Date();
    metrics.popularityScore = this.calculatePopularity(metrics);

    await this.updateActivityTrends(type, data);
    await this.persistMetrics(type, metrics);
  }

  async getPopularActivities(limit: number = 10): Promise<ActivityType[]> {
    const sortedActivities = Array.from(this.activities.entries())
      .sort(([, a], [, b]) => b.popularityScore - a.popularityScore)
      .slice(0, limit);

    return sortedActivities.map(([type]) => type);
  }

  private calculatePopularity(metrics: ActivityMetrics): PopularityScore {
    return {
      score: (
        metrics.totalCount * 0.4 +
        metrics.uniqueUsers * 0.3 +
        metrics.completionRate * 0.2 +
        metrics.averageRating * 0.1
      ),
      factors: {
        engagement: metrics.totalCount / metrics.uniqueUsers,
        retention: metrics.repeatUsers / metrics.uniqueUsers,
        satisfaction: metrics.averageRating
      }
    };
  }

  private async updateActivityTrends(type: ActivityType, data: any): Promise<void> {
    // Implementation for trend analysis
  }
} 