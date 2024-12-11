export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export class WeatherAPIError extends WeatherServiceError {
  constructor(message: string, public statusCode?: number) {
    super(`Weather API Error: ${message}`);
    this.name = 'WeatherAPIError';
  }
}

export class WeatherRateLimitError extends WeatherServiceError {
  constructor() {
    super('Weather API rate limit exceeded');
    this.name = 'WeatherRateLimitError';
  }
} 