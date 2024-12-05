import { GeoPoint, RoutePreferences, RouteConstraints } from '../../types/mcp.types';
import { Message, ContentBlock } from '@anthropic-ai/sdk';

export interface RouteGenerationRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: RoutePreferences;
  constraints?: RouteConstraints;
}

export interface POIRequest {
  location: GeoPoint;
  radius: number;
  categories?: string[];
  limit?: number;
}

export interface RouteResource {
  uri: string;
  name: string;
  mimeType: string;
  description: string;
  context?: RouteGenerationRequest;
}

export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface ClaudeResponse {
  content: ContentBlock[];
  model: string;
  role: string;
}

export interface ServerError extends Error {
  code: string;
  retryable: boolean;
  details?: any;
}

// Type guards
export function isValidRouteRequest(args: any): args is RouteGenerationRequest {
  return (
    typeof args === 'object' &&
    args !== null &&
    'startPoint' in args &&
    'endPoint' in args &&
    'preferences' in args &&
    typeof args.startPoint.lat === 'number' &&
    typeof args.startPoint.lng === 'number' &&
    typeof args.endPoint.lat === 'number' &&
    typeof args.endPoint.lng === 'number'
  );
}

export function isValidPOIRequest(args: any): args is POIRequest {
  return (
    typeof args === 'object' &&
    args !== null &&
    'location' in args &&
    'radius' in args &&
    typeof args.location.lat === 'number' &&
    typeof args.location.lng === 'number' &&
    typeof args.radius === 'number'
  );
}

export function isClaudeResponse(response: any): response is ClaudeResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    Array.isArray(response.content) &&
    typeof response.model === 'string' &&
    typeof response.role === 'string'
  );
}

export function isServerError(error: unknown): error is ServerError {
  return (
    error instanceof Error &&
    'code' in error &&
    'retryable' in error &&
    typeof (error as any).code === 'string' &&
    typeof (error as any).retryable === 'boolean'
  );
}

// Error codes
export enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  CLAUDE_API_ERROR = 'CLAUDE_API_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Helper function to create server errors
export function createServerError(code: ErrorCode, message: string, retryable = false, details?: any): ServerError {
  const error = new Error(message) as ServerError;
  error.code = code;
  error.retryable = retryable;
  error.details = details;
  return error;
} 