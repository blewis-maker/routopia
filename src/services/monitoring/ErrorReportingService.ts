import { prisma } from '@/lib/prisma';
import { Sentry } from '@/lib/sentry';
import { redis } from '@/lib/redis';

export interface ErrorDetails {
  userId?: string;
  activityId?: string;
  provider?: string;
  operation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export class ErrorReportingService {
  private readonly ERROR_CACHE_TTL = 3600; // 1 hour
  private readonly ERROR_THRESHOLD = 5; // Number of errors before alerting

  async reportError(error: Error, details: ErrorDetails): Promise<void> {
    // Log to database
    const errorLog = await this.logError(error, details);

    // Send to Sentry if critical
    if (details.severity === 'critical' || details.severity === 'high') {
      await this.sendToSentry(error, details);
    }

    // Check error threshold and send alerts if needed
    await this.checkErrorThreshold(details);

    // Cache error for quick access
    await this.cacheError(errorLog.id, error, details);
  }

  private async logError(error: Error, details: ErrorDetails) {
    return await prisma.errorLog.create({
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        severity: details.severity,
        userId: details.userId,
        activityId: details.activityId,
        provider: details.provider,
        operation: details.operation,
        metadata: details.metadata || {},
        timestamp: new Date()
      }
    });
  }

  private async sendToSentry(error: Error, details: ErrorDetails) {
    Sentry.withScope(scope => {
      if (details.userId) scope.setUser({ id: details.userId });
      if (details.provider) scope.setTag('provider', details.provider);
      if (details.operation) scope.setTag('operation', details.operation);
      if (details.metadata) scope.setExtras(details.metadata);
      scope.setLevel(this.getSentryLevel(details.severity));
      
      Sentry.captureException(error);
    });
  }

  private async checkErrorThreshold(details: ErrorDetails) {
    const key = this.getErrorKey(details);
    const count = await redis.incr(key);
    await redis.expire(key, this.ERROR_CACHE_TTL);

    if (count >= this.ERROR_THRESHOLD) {
      await this.sendAlert(details);
      await redis.del(key); // Reset counter after alert
    }
  }

  private async cacheError(
    id: string,
    error: Error,
    details: ErrorDetails
  ): Promise<void> {
    const cacheKey = `error:${id}`;
    await redis.setex(
      cacheKey,
      this.ERROR_CACHE_TTL,
      JSON.stringify({
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        details,
        timestamp: new Date()
      })
    );
  }

  private async sendAlert(details: ErrorDetails) {
    // Implement alert sending (email, Slack, etc.)
    console.error('Error threshold exceeded:', details);
  }

  private getErrorKey(details: ErrorDetails): string {
    const components = [
      details.provider || 'system',
      details.operation || 'general',
      details.severity
    ];
    return `errors:${components.join(':')}`;
  }

  private getSentryLevel(severity: string): Sentry.SeverityLevel {
    switch (severity) {
      case 'critical': return 'fatal';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'error';
    }
  }
} 