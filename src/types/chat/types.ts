import { WeatherConditions, ActivityContext } from '@/types/activities';

export interface ChatSuggestion {
  name: string;
  description: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    state?: string;
  };
}

export interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  suggestions?: {
    waypoints: ChatSuggestion[];
    attractions: string[];
    breaks: string[];
  };
}

export interface RouteContext {
  start: string;
  end: string;
  mode: string;
  timeOfDay: string;
  message: string;
  weather: WeatherConditions;
  activity: ActivityContext;
  preferences: string[];
  userId?: string;
  timeContext: {
    startTime?: string;
    preferredArrival?: string;
    timeOfDay: string;
    dayOfWeek: number;
  };
}

export interface RouteSuggestions {
  waypoints: Array<{
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    type: 'attraction' | 'rest' | 'viewpoint';
    description: string;
  }>;
  attractions: string[];
  breaks: string[];
}

export interface EnhancedRoute {
  insights: string[];
  warnings: string[];
  suggestions: string[];
  duration?: number;
}

export interface EnhancedRouteWithSuggestion extends EnhancedRoute {
  suggestion?: ChatSuggestion;
}

export interface AIResponse {
  message: string;
  suggestion?: ChatSuggestion;
} 