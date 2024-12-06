import type { 
  ActivityMetrics,
  ActivitySummary,
  RealTimeMetrics,
  TrackingPreferences,
  ProgressUpdate
} from '@/types/activity';

export class ActivityTrackingService {
  private readonly metricsCollector: MetricsCollector;
  private readonly performanceAnalyzer: PerformanceAnalyzer;
  private readonly achievementTracker: AchievementTracker;

  async startTracking(
    activityType: string,
    preferences: TrackingPreferences
  ): Promise<string> {
    const session = await this.initializeSession(activityType, preferences);
    await this.startMetricsCollection(session.id);
    return session.id;
  }

  async trackRealTimeMetrics(
    sessionId: string,
    location: GeoLocation
  ): Promise<RealTimeMetrics> {
    const rawMetrics = await this.metricsCollector.collect(sessionId, location);
    const analyzedMetrics = await this.performanceAnalyzer.analyze(rawMetrics);
    
    await this.updateProgress(sessionId, analyzedMetrics);
    return this.enrichMetricsWithContext(analyzedMetrics, location);
  }

  private async updateProgress(
    sessionId: string,
    metrics: ActivityMetrics
  ): Promise<ProgressUpdate> {
    const progress = await this.calculateProgress(sessionId, metrics);
    const achievements = await this.achievementTracker.checkAchievements(
      sessionId,
      metrics
    );
    
    return {
      currentProgress: progress,
      newAchievements: achievements,
      recommendations: this.generateRecommendations(progress, metrics)
    };
  }

  async pauseTracking(sessionId: string): Promise<void> {
    await this.metricsCollector.pause(sessionId);
    await this.saveIntermediateState(sessionId);
  }

  async resumeTracking(sessionId: string): Promise<void> {
    await this.loadIntermediateState(sessionId);
    await this.metricsCollector.resume(sessionId);
  }

  async stopTracking(sessionId: string): Promise<ActivitySummary> {
    const finalMetrics = await this.metricsCollector.getFinalMetrics(sessionId);
    const analysis = await this.performanceAnalyzer.generateSummary(
      sessionId,
      finalMetrics
    );
    
    return {
      ...analysis,
      achievements: await this.achievementTracker.finalizeAchievements(sessionId),
      recommendations: this.generateFinalRecommendations(analysis)
    };
  }

  private enrichMetricsWithContext(
    metrics: ActivityMetrics,
    location: GeoLocation
  ): RealTimeMetrics {
    return {
      ...metrics,
      environmentalConditions: this.getEnvironmentalContext(location),
      safetyMetrics: this.assessSafetyMetrics(metrics, location),
      performanceContext: this.analyzePerformanceContext(metrics)
    };
  }

  async getActivityHistory(
    userId: string,
    timeframe: string
  ): Promise<ActivitySummary[]> {
    const activities = await this.fetchActivityHistory(userId, timeframe);
    return this.enrichActivitiesWithInsights(activities);
  }
} 