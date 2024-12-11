import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Sentry } from '@/lib/sentry';

export interface ErrorLogOptions {
  userId?: string;
  activityId?: string;
  provider?: string;
  operation?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export class ErrorLogger {
  static async log(error: Error, options: ErrorLogOptions = {}): Promise<void> {
    // Log to database
    await this.logToDatabase(error, options);
    
    // Send to Sentry if critical
    if (options.severity === 'critical') {
      this.logToSentry(error, options);
    }

    // Alert if needed
    if (this.shouldAlert(options.severity)) {
      await this.sendAlert(error, options);
    }
  }

  private static async logToDatabase(error: Error, options: ErrorLogOptions) {
    const data: Prisma.ErrorLogCreateInput = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity: options.severity || 'medium',
      userId: options.userId,
      activityId: options.activityId,
      provider: options.provider,
      operation: options.operation,
      metadata: options.metadata || {}
    };

    await prisma.errorLog.create({ data });
  }

  private static logToSentry(error: Error, options: ErrorLogOptions) {
    Sentry.withScope(scope => {
      if (options.userId) scope.setUser({ id: options.userId });
      if (options.provider) scope.setTag('provider', options.provider);
      if (options.operation) scope.setTag('operation', options.operation);
      if (options.metadata) scope.setExtras(options.metadata);
      
      Sentry.captureException(error);
    });
  }

  private static shouldAlert(severity?: string): boolean {
    return severity === 'critical' || severity === 'high';
  }

  private static async sendAlert(error: Error, options: ErrorLogOptions) {
    // Implementation for sending alerts (email, Slack, etc.)
  }
} 