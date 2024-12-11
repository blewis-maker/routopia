export class StravaError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'StravaError';
  }

  static fromResponse(response: Response, data: any): StravaError {
    return new StravaError(
      data.message || response.statusText,
      data.errors?.[0]?.code,
      response.status
    );
  }
}

export class StravaRateLimitError extends StravaError {
  constructor(message: string, public readonly resetTime: Date) {
    super(message, 'rate_limit_exceeded', 429);
    this.name = 'StravaRateLimitError';
  }
}

export class StravaAuthError extends StravaError {
  constructor(message: string) {
    super(message, 'authentication_failed', 401);
    this.name = 'StravaAuthError';
  }
} 
 