export class ActivityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityError';
  }
} 