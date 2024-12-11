export interface RetryStrategy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: Error, attempt: number) => boolean;
  getDelay: (attempt: number, baseDelay: number) => number;
}

export const exponentialRetry: RetryStrategy = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error: Error, attempt: number) => {
    // Retry on connection errors or rate limits
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('rate limit')
    );
  },
  getDelay: (attempt: number, baseDelay: number) => {
    const delay = Math.min(
      Math.pow(2, attempt - 1) * baseDelay,
      exponentialRetry.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 100;
  }
}; 