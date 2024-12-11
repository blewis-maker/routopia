import * as Sentry from '@sentry/nextjs';

export function setupMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma(),
    ],
  });
}

export function monitorPromise<T>(
  promise: Promise<T>,
  name: string,
  tags: Record<string, string> = {}
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name,
    op: 'ai.vector-search',
    tags
  });

  return promise
    .then((result) => {
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('error');
      Sentry.captureException(error, { tags });
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
} 