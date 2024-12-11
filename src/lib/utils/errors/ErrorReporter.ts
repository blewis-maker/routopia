import { captureException, withScope, Scope } from '@sentry/nextjs';

export interface ErrorContext {
  userId?: string;
  activityId?: string;
  provider?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

export class ErrorReporter {
  static async report(error: Error, context: ErrorContext) {
    withScope((scope) => {
      this.addContextToScope(scope, context);
      captureException(error);
    });

    // Also log to our monitoring system
    await this.logError(error, context);
  }

  private static addContextToScope(scope: Scope, context: ErrorContext) {
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    if (context.activityId) {
      scope.setTag('activityId', context.activityId);
    }

    if (context.provider) {
      scope.setTag('provider', context.provider);
    }

    if (context.operation) {
      scope.setTag('operation', context.operation);
    }

    if (context.metadata) {
      scope.setExtras(context.metadata);
    }
  }

  private static async logError(error: Error, context: ErrorContext) {
    await prisma.errorLog.create({
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        userId: context.userId,
        activityId: context.activityId,
        provider: context.provider,
        operation: context.operation,
        metadata: context.metadata || {},
        timestamp: new Date()
      }
    });
  }
} 