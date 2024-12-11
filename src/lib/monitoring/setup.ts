import * as Sentry from '@sentry/nextjs';

export function setupMonitoring() {
  // Temporarily disabled Sentry
  console.log('Monitoring setup disabled');
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