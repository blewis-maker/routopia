import { RouteContext } from '../route';
import { WeatherConditions } from '../weather';
import { POIRecommendation } from '../poi';
import { ChatMessage } from '../chat';
import { AIRequest, AIResponse } from '../ai';

export interface MCPRequest {
  type: 'route' | 'weather' | 'poi' | 'chat' | 'ai';
  payload: unknown;
  timestamp: string;
  requestId: string;
}

export interface MCPResponse {
  type: 'route' | 'weather' | 'poi' | 'chat' | 'ai';
  payload: unknown;
  timestamp: string;
  requestId: string;
  status: 'success' | 'error';
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface MCPServiceConfig {
  endpoint: string;
  apiKey: string;
  version: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
}

export interface MCPSubscription {
  type: 'route' | 'weather' | 'poi';
  id: string;
  callback: (data: unknown) => void;
  filters?: Record<string, unknown>;
}

export interface MCPEvent {
  type: string;
  payload: unknown;
  timestamp: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
}

// Re-export types from their proper domains
export type {
  RouteContext,
  WeatherConditions,
  POIRecommendation,
  ChatMessage,
  AIRequest,
  AIResponse
};
 