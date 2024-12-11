import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class ErrorAnalyzer {
  private readonly ANALYSIS_CACHE_TTL = 300; // 5 minutes

  async analyzeErrors(timeRange: string): Promise<any> {
    const cacheKey = `error:analysis:${timeRange}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const errors = await this.getErrors(timeRange);
    const analysis = {
      trends: await this.analyzeTrends(errors),
      patterns: await this.findPatterns(errors),
      hotspots: await this.identifyHotspots(errors),
      recommendations: await this.generateRecommendations(errors)
    };

    await redis.setex(cacheKey, this.ANALYSIS_CACHE_TTL, JSON.stringify(analysis));
    return analysis;
  }

  private async getErrors(timeRange: string) {
    const since = this.getTimeRangeDate(timeRange);
    return await prisma.errorLog.findMany({
      where: {
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  private async analyzeTrends(errors: any[]) {
    // Implement trend analysis
    return {
      errorRate: this.calculateErrorRate(errors),
      severityDistribution: this.calculateSeverityDistribution(errors),
      timeDistribution: this.calculateTimeDistribution(errors)
    };
  }

  private async findPatterns(errors: any[]) {
    // Implement pattern recognition
    return {
      commonMessages: this.findCommonMessages(errors),
      relatedErrors: this.findRelatedErrors(errors),
      impactedUsers: this.analyzeUserImpact(errors)
    };
  }

  private async identifyHotspots(errors: any[]) {
    // Implement hotspot identification
    return {
      topComponents: this.findTopErrorComponents(errors),
      criticalPaths: this.identifyCriticalPaths(errors),
      resourceIssues: this.analyzeResourceIssues(errors)
    };
  }

  private async generateRecommendations(errors: any[]) {
    // Generate actionable recommendations
    return {
      immediate: this.getImmediateActions(errors),
      shortTerm: this.getShortTermFixes(errors),
      longTerm: this.getLongTermImprovements(errors)
    };
  }

  // Helper methods...
  private getTimeRangeDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 3600000);
      case '24h': return new Date(now.getTime() - 86400000);
      case '7d': return new Date(now.getTime() - 604800000);
      case '30d': return new Date(now.getTime() - 2592000000);
      default: return new Date(now.getTime() - 86400000);
    }
  }

  private calculateErrorRate(errors: any[]): number {
    const timeSpan = 3600000; // 1 hour in milliseconds
    const now = Date.now();
    const recentErrors = errors.filter(e => 
      new Date(e.timestamp).getTime() > now - timeSpan
    );
    return recentErrors.length / (timeSpan / 1000 / 60 / 60); // errors per hour
  }

  private calculateSeverityDistribution(errors: any[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateTimeDistribution(errors: any[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      const hour = new Date(error.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
  }
} 