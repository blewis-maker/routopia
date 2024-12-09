import { OpenAIRouteEnhancer } from '../ai/OpenAIRouteEnhancer';
import { RouteContext, RouteSuggestions } from '@/types/chat/types';
import { GoogleMapsManager } from '../maps/GoogleMapsManager';

export class RouteAIService {
  private aiEnhancer: OpenAIRouteEnhancer;
  private mapService?: GoogleMapsManager;
  private routeContext: {
    recentSuggestions: Set<string>;
    userPreferences: string[];
    timeOfDay: string;
  } = {
    recentSuggestions: new Set(),
    userPreferences: [],
    timeOfDay: ''
  };

  constructor(mapService?: GoogleMapsManager) {
    this.aiEnhancer = new OpenAIRouteEnhancer();
    this.mapService = mapService;
  }

  async processUserMessage(message: string, context?: Partial<RouteContext>): Promise<{
    message: string;
    suggestions?: RouteSuggestions;
  }> {
    try {
      const routeContext = await this.extractRouteContext(message, context);
      const suggestions = await this.aiEnhancer.generateSuggestions(routeContext);
      const enhancedRoute = await this.aiEnhancer.enhanceRoute(routeContext);

      // Visualize suggestions if map service is available
      if (this.mapService && suggestions.waypoints.length > 0) {
        await this.mapService.visualizeSuggestions(suggestions.waypoints);
      }

      return {
        message: this.constructResponse(enhancedRoute, suggestions),
        suggestions
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I'm having trouble processing your request. Could you try rephrasing it?"
      };
    }
  }

  private async extractRouteContext(message: string, existingContext?: Partial<RouteContext>): Promise<RouteContext> {
    // Implement logic to extract route information from message
    // This could use another OpenAI call or simple pattern matching
    return {
      start: existingContext?.start || 'Current Location',
      end: existingContext?.end || 'Unknown',
      mode: existingContext?.mode || 'car',
      timeOfDay: new Date().toLocaleTimeString(),
      weather: existingContext?.weather || {
        temperature: 0,
        conditions: 'unknown',
        windSpeed: 0
      },
      preferences: existingContext?.preferences || []
    };
  }

  private constructResponse(route: EnhancedRoute, suggestions: RouteSuggestions): string {
    let response = '';

    if (route.insights.length) {
      response += "Here's what I know about this route:\n";
      response += route.insights.join('\n') + '\n\n';
    }

    if (route.warnings.length) {
      response += "Important considerations:\n";
      response += route.warnings.join('\n') + '\n\n';
    }

    if (suggestions.waypoints.length) {
      response += "You might want to check out:\n";
      response += suggestions.waypoints
        .map(wp => `- ${wp.name}: ${wp.description}`)
        .join('\n');
    }

    return response;
  }

  private filterSuggestions(suggestions: RouteSuggestions): RouteSuggestions {
    return {
      ...suggestions,
      waypoints: suggestions.waypoints.filter(wp => {
        // Don't suggest places we've recently suggested
        if (this.routeContext.recentSuggestions.has(wp.name)) return false;
        
        // Filter based on time of day
        const currentHour = new Date().getHours();
        if (wp.type === 'restaurant' && (currentHour < 11 || currentHour > 22)) return false;
        
        return true;
      })
    };
  }
} 