import type { Message } from '@anthropic-ai/sdk';

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolUseBlock {
  type: 'tool_use';
  tool_calls: ToolCall[];
}

export type ContentBlock = TextBlock | ToolUseBlock;

export interface Message extends Omit<Message, 'content'> {
  content: ContentBlock[];
}

export interface ToolResponse {
  content: ContentBlock[];
  tools?: {
    name: string;
    description?: string;
    inputSchema: {
      type: 'object';
      properties?: Record<string, unknown>;
    };
  }[];
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CLAUDE_API_ERROR = 'CLAUDE_API_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RECOMMENDATION_ERROR = 'RECOMMENDATION_ERROR',
  NO_RESULTS = 'NO_RESULTS',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INVALID_LOCATION = 'INVALID_LOCATION',
  INVALID_RADIUS = 'INVALID_RADIUS',
  INVALID_CATEGORY = 'INVALID_CATEGORY'
}

export interface Point {
  lat: number;
  lng: number;
}

export enum ActivityType {
  WALK = 'WALK',
  RUN = 'RUN',
  BIKE = 'BIKE',
  CAR = 'CAR',
  SKI = 'SKI',
  HIKE = 'HIKE',
  PHOTO = 'PHOTO',
  FOOD = 'FOOD',
  TEAM = 'TEAM',
  TRAINING = 'TRAINING',
  SIGHTSEEING = 'SIGHTSEEING',
  SHOPPING = 'SHOPPING'
}

export enum POICategory {
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  PARK = 'PARK',
  MUSEUM = 'MUSEUM',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  LANDMARK = 'LANDMARK'
}

export interface POIRequest {
  location: Point;
  radius: number;
  activityType: ActivityType;
  categories?: POICategory[];
  filters?: {
    openNow?: boolean;
    rating?: number;
    priceLevel?: string;
    weatherSensitive?: boolean;
    accessibility?: {
      wheelchairAccessible?: boolean;
      familyFriendly?: boolean;
      petFriendly?: boolean;
    };
    amenities?: string[];
  };
  preferences?: {
    preferIndoor?: boolean;
    maxPrice?: number;
    minRating?: number;
    safetyPriority?: 'low' | 'moderate' | 'high';
  };
}

export interface POIResult {
  id: string;
  name: string;
  category: POICategory;
  location: Point;
  distance: number;
  rating?: number;
  weatherSensitive: boolean;
  openingHours?: string;
}

export interface POISearchResult {
  results: POIResult[];
  metadata: {
    total: number;
    radius: number;
    categories: POICategory[];
    searchTime: number;
  };
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  visibility: number;
  forecast?: WeatherData[];
  timestamp?: number;
}

export interface RouteGenerationRequest {
  startPoint: Point;
  endPoint: Point;
  preferences: {
    activityType: ActivityType;
    includePointsOfInterest?: boolean;
    poiCategories?: POICategory[];
    avoidHills?: boolean;
    maxDistance?: number;
    maxDuration?: number;
    constraints?: {
      maxStops?: number;
      poiStopDuration?: number;
      departureTime?: string;
      arrivalTime?: string;
      timeWindows?: Array<{
        type: string;
        preferredTime: string;
      }>;
    };
  };
}

export interface RouteResponse {
  route: {
    points: Point[];
    distance: number;
    duration: number;
    elevation?: number;
  };
  pois: POIResult[];
  weather: WeatherData;
  metadata: {
    distance: number;
    duration: number;
    difficulty: string;
    poiCount: number;
  };
}

export interface UserPreferences {
  preferredActivities?: ActivityType[];
  preferredIntensity?: 'LOW' | 'MEDIUM' | 'HIGH';
  preferIndoor?: boolean;
  preferredDuration?: number;
  maxDistance?: number;
  avoidHills?: boolean;
  preferScenic?: boolean;
}

export interface ActivityRecommendation {
  type: ActivityType;
  title: string;
  description: string;
  location: Point;
  duration: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  indoor: boolean;
  weatherSensitive: boolean;
  poiCategory: POICategory | null;
}

export interface GooglePlacesResult {
  place_id: string;
  name: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface GooglePlacesResponse {
  data: {
    results: GooglePlacesResult[];
    status: string;
  };
}

export interface ServerError extends Error {
  code: ErrorCode;
  retryable: boolean;
  details?: unknown;
}

export function createServerError(
  code: ErrorCode,
  message: string,
  retryable = false,
  details?: unknown
): ServerError {
  const error = new Error(message) as ServerError;
  error.code = code;
  error.retryable = retryable;
  error.details = details;
  return error;
}

export interface RouteResource {
  uri: string;
  name: string;
  context: {
    type: 'route';
    data: {
      context: Record<string, unknown>;
      response: Record<string, unknown>;
    };
  };
}

export function isValidRouteRequest(request: unknown): request is RouteGenerationRequest {
  if (!request || typeof request !== 'object') return false;
  const req = request as RouteGenerationRequest;
  return (
    req.startPoint &&
    typeof req.startPoint.lat === 'number' &&
    typeof req.startPoint.lng === 'number' &&
    req.endPoint &&
    typeof req.endPoint.lat === 'number' &&
    typeof req.endPoint.lng === 'number' &&
    req.preferences &&
    typeof req.preferences.activityType === 'string'
  );
}

export function isValidPOIRequest(request: unknown): request is POIRequest {
  if (!request || typeof request !== 'object') return false;
  const req = request as POIRequest;
  return (
    req.location &&
    typeof req.location.lat === 'number' &&
    typeof req.location.lng === 'number' &&
    typeof req.radius === 'number' &&
    req.radius > 0 &&
    typeof req.activityType === 'string'
  );
}

export function isClaudeResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  const resp = response as Record<string, unknown>;
  return (
    typeof resp.content === 'string' &&
    (!resp.metadata || typeof resp.metadata === 'object')
  );
}

export function isServerError(error: unknown): error is ServerError {
  if (!error || typeof error !== 'object') return false;
  const err = error as ServerError;
  return (
    err instanceof Error &&
    typeof err.code === 'string' &&
    typeof err.retryable === 'boolean'
  );
} 