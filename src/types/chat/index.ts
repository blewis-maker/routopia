import { GeoPoint } from '../geo';
import { RouteContext } from '../route';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    route?: RouteContext;
    location?: GeoPoint;
    suggestions?: string[];
    error?: string;
  };
}

export interface ChatResponse {
  content: string;
  context?: {
    route?: RouteContext;
    location?: GeoPoint;
    suggestions?: string[];
  };
}

export interface ChatError {
  message: string;
  code: string;
  details?: any;
} 