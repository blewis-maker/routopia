export interface ChatSuggestion {
  name: string;
  type: 'attraction' | 'rest' | 'viewpoint';
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  distance?: string;
  eta?: string;
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
  mode: 'car' | 'bike' | 'walk';
  timeOfDay: string;
  message?: string;
  weather: {
    temperature: number;
    conditions: string;
    windSpeed: number;
  };
  duration?: number;
  preferences?: string[];
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