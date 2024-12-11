import { ActivityMetrics } from './metrics';
import { ActivityInput, ActivityData } from './activity';

export interface ActivityTransformer {
  transform(rawData: Record<string, any>): ActivityInput;
  validateRequired(data: Record<string, any>): boolean;
  calculateMetrics(data: Record<string, any>): ActivityMetrics;
  validateMetrics(metrics: ActivityMetrics): boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class TransformerError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'TransformerError';
  }
} 