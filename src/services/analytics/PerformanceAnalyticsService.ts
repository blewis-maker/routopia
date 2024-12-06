import type { 
  PerformanceMetrics,
  AnalyticsReport,
  TrendAnalysis,
  PerformanceInsights,
  UserProgress
} from '@/types/analytics';

export class PerformanceAnalyticsService {
  private readonly dataCollector: MetricsDataCollector;
  private readonly insightGenerator: InsightGenerator;
  private readonly trendAnalyzer: TrendAnalyzer;

  async generatePerformanceReport(
    userId: string,
    timeframe: string
  ): Promise<AnalyticsReport> {
    const metrics = await this.collectPerformanceData(userId, timeframe);
    const trends = await this.analyzeTrends(metrics, timeframe);
    const insights = this.generateInsights(metrics, trends);
    
    return {
      metrics,
      trends,
      insights,
      recommendations: this.generateRecommendations(insights)
    };
  }

  private async collectPerformanceData(
    userId: string,
    timeframe: string
  ): Promise<PerformanceMetrics> {
    return {
      activities: await this.dataCollector.getActivityMetrics(userId, timeframe),
      progress: await this.calculateProgress(userId, timeframe),
      achievements: await this.getAchievements(userId, timeframe),
      comparisons: await this.generateComparisons(userId, timeframe)
    };
  }

  private async analyzeTrends(
    metrics: PerformanceMetrics,
    timeframe: string
  ): Promise<TrendAnalysis> {
    return {
      performance: this.trendAnalyzer.analyzePerformance(metrics, timeframe),
      improvement: this.trendAnalyzer.calculateImprovement(metrics),
      patterns: this.trendAnalyzer.identifyPatterns(metrics),
      predictions: await this.generatePredictions(metrics, timeframe)
    };
  }

  private generateInsights(
    metrics: PerformanceMetrics,
    trends: TrendAnalysis
  ): PerformanceInsights {
    return {
      strengths: this.insightGenerator.identifyStrengths(metrics, trends),
      weaknesses: this.insightGenerator.identifyWeaknesses(metrics, trends),
      opportunities: this.insightGenerator.findOpportunities(metrics, trends),
      risks: this.insightGenerator.assessRisks(metrics, trends)
    };
  }

  async trackProgress(
    userId: string,
    activityType: string
  ): Promise<UserProgress> {
    const history = await this.getActivityHistory(userId, activityType);
    const progress = this.calculateProgressMetrics(history);
    const goals = await this.getGoals(userId, activityType);
    
    return {
      current: this.assessCurrentLevel(progress),
      historical: this.analyzeHistoricalProgress(progress),
      projections: this.generateProjections(progress, goals),
      recommendations: this.createProgressRecommendations(progress, goals)
    };
  }

  async generateCustomReport(
    userId: string,
    metrics: string[],
    timeframe: string
  ): Promise<CustomAnalyticsReport> {
    const data = await this.collectCustomMetrics(userId, metrics, timeframe);
    return this.createCustomizedReport(data, metrics);
  }
} 