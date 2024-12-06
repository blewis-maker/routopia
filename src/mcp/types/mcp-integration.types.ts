import { Message } from '@anthropic-ai/sdk';
import { RouteContext, GeoPoint, POIRecommendation } from './mcp.types';

export interface MCPIntegrationConfig extends MCPConfig {
  features: {
    routePlanning: boolean;
    userInteraction: boolean;
    realTimeAssistance: boolean;
    poiRecommendations: boolean;
  };
  userPreferences: {
    learningEnabled: boolean;
    historyLength: number;
    adaptationRate: number;
  };
}

export interface UserInteractionContext {
  messageHistory: ChatMessage[];
  currentRoute?: RouteContext;
  userPreferences: UserPreferences;
  sessionContext: SessionContext;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  context?: {
    route?: RouteContext;
    location?: GeoPoint;
    weather?: WeatherInfo;
    poi?: POIRecommendation[];
  };
}

export interface UserPreferences {
  preferredActivityTypes: string[];
  routePreferences: {
    maxDistance?: number;
    maxDuration?: number;
    preferredDifficulty?: string;
    avoidFeatures?: string[];
  };
  poiPreferences: {
    categories: string[];
    maxDetourDistance: number;
    minimumRating: number;
  };
}

export interface SessionContext {
  startTime: number;
  location: GeoPoint;
  weather: WeatherInfo;
  activeRoute?: RouteContext;
  recentPOIs: POIRecommendation[];
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  visibility: number;
}

export interface MCPPromptTemplate {
  routePlanning: string;
  poiRecommendation: string;
  userInteraction: string;
  weatherAdaptation: string;
}

export interface MCPFeatureConfig {
  routePlanning: {
    optimizationLevel: 'basic' | 'advanced';
    considerTraffic: boolean;
    considerWeather: boolean;
    maxAlternatives: number;
  };
  userInteraction: {
    responseStyle: 'concise' | 'detailed';
    personalityType: 'professional' | 'friendly';
    languageModel: 'claude-3-opus' | 'claude-3-sonnet';
  };
  realTimeAssistance: {
    updateInterval: number;
    alertThresholds: {
      weather: number;
      traffic: number;
      detours: number;
    };
  };
}

export interface MCPAnalytics {
  routeGeneration: {
    requestCount: number;
    averageResponseTime: number;
    successRate: number;
    optimizationMetrics: RouteOptimizationMetrics;
  };
  userInteraction: {
    messageCount: number;
    averageResponseTime: number;
    userSatisfactionScore: number;
  };
  poiRecommendations: {
    totalRecommendations: number;
    acceptanceRate: number;
    relevanceScore: number;
  };
}

export interface RouteOptimizationMetrics {
  distanceEfficiency: number;
  elevationOptimization: number;
  scenicValueScore: number;
  poiIntegrationScore: number;
} 