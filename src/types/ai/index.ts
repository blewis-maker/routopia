import { GeoPoint } from '../geo';
import { RouteContext, RoutePreferences } from '../route';
import { ActivityType, ActivityPreferences } from '../activity';
import { WeatherConditions } from '../weather';
import { POIRecommendation } from '../poi';

export interface AIRequest {
  type: 'route' | 'chat' | 'recommendation';
  context: AIContext;
  input: string;
}

export interface AIResponse {
  type: 'route' | 'chat' | 'recommendation';
  content: string;
  context?: AIContext;
  suggestions?: string[];
  confidence: number;
  alternatives?: any[];
}

export interface AIContext {
  route?: RouteContext;
  location?: GeoPoint;
  activity?: ActivityType;
  preferences?: RoutePreferences & ActivityPreferences;
  weather?: WeatherConditions;
  pois?: POIRecommendation[];
  userProfile?: {
    experienceLevel?: 'beginner' | 'intermediate' | 'expert';
    preferences?: Record<string, any>;
    history?: {
      recentRoutes?: RouteContext[];
      favoriteLocations?: GeoPoint[];
      preferredActivities?: ActivityType[];
    };
  };
  sessionContext?: {
    startTime: number;
    lastInteraction: number;
    interactionCount: number;
    previousResponses?: AIResponse[];
  };
}

export interface RouteGenerationRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  activityType: ActivityType;
  preferences?: RoutePreferences;
  constraints?: {
    maxDistance?: number;
    maxDuration?: number;
    maxElevation?: number;
    requiredPOIs?: string[];
    avoidAreas?: GeoPoint[][];
    timeConstraints?: {
      departureTime?: string;
      arrivalTime?: string;
    };
  };
  optimizationCriteria?: {
    prioritizeScenic?: boolean;
    minimizeTraffic?: boolean;
    balanceEffortDistribution?: boolean;
    maximizeSafety?: boolean;
    includeAlternatives?: boolean;
  };
}

export interface RouteRecommendationRequest {
  location: GeoPoint;
  activityType: ActivityType;
  preferences?: ActivityPreferences;
  timeAvailable?: number;
  radius?: number;
  includePopular?: boolean;
  weatherSensitive?: boolean;
}

export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface AIFeature {
  name: string;
  description: string;
  type: 'safety' | 'optimization' | 'recommendation' | 'analysis';
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AIAnalysis {
  features: AIFeature[];
  recommendations: string[];
  warnings?: string[];
  confidence: number;
  metadata?: {
    processingTime: number;
    modelVersion: string;
    dataTimestamp: string;
  };
} 