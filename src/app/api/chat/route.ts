import { NextResponse } from 'next/server';
import { OpenAIRouteEnhancer } from '@/services/ai/OpenAIRouteEnhancer';
import { RouteContext, AIResponse, EnhancedRouteWithSuggestion } from '@/types/chat/types';
import { validateEnv } from '@/lib/env';
import { ChatResponseEnricher } from '@/services/ai/ChatResponseEnricher';
import { RouteAIService } from '@/services/ai/RouteAIService';
import { ChatResponseFormatter } from '@/services/ai/ChatResponseFormatter';
import { TimeBasedRecommender } from '@/services/ai/TimeBasedRecommender';
import { WeatherService } from '@/services/weather/WeatherService';
import { UserActivityService } from '@/services/activity/UserActivityService';
import { SemanticSearchHandler } from '@/services/ai/SemanticSearchHandler';
import { PineconeService } from '@/services/search/PineconeService';
import { RouteDescriptionGenerator } from '@/services/ai/RouteDescriptionGenerator';

// Initialize services with proper instantiation
const weatherService = WeatherService.getInstance();
const userActivityService = UserActivityService.getInstance();
const routeEnhancer = OpenAIRouteEnhancer.getInstance();
const searchHandler = new SemanticSearchHandler(
  new PineconeService(),
  new RouteDescriptionGenerator()
);

export async function POST(request: Request) {
  try {
    validateEnv();
    
    const { message, context } = await request.json();
    console.log('Chat request:', { message, context });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if it's a search query
    if (isSearchQuery(message)) {
      const searchResults = await searchHandler.handleSearchQuery(message, {
        activityType: context.activity?.activityType,
        difficulty: context.userProfile?.preferences?.skill_level,
        distance: context.routeConstraints?.maxDistance
      });

      return NextResponse.json({
        message: formatSearchResponse(searchResults),
        suggestions: searchResults.map(route => ({
          type: 'route',
          route: route
        }))
      });
    }

    // Initialize services
    const routeAIService = new RouteAIService(weatherService, userActivityService);
    const formatter = new ChatResponseFormatter();
    const timeRecommender = new TimeBasedRecommender();

    // Get enhanced route with weather context
    const enhancedRoute = await routeAIService.enhanceRoute(context);

    // Add time-based recommendations
    const timeRecommendations = timeRecommender.getTimeBasedRecommendations(
      context.activity.activityType,
      {
        hour: new Date().getHours(),
        weather: context.weather,
        userPrefs: await userActivityService.getUserPreferences(context.userId),
        dayOfWeek: new Date().getDay()
      }
    );

    // Format final response
    const formattedResponse = formatter.formatResponse({
      ...enhancedRoute,
      suggestions: [...enhancedRoute.suggestions, ...timeRecommendations]
    });

    return NextResponse.json({ message: formattedResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

function isSearchQuery(message: string): boolean {
  const searchKeywords = [
    'find', 'search', 'looking for', 'similar to',
    'like', 'recommend', 'suggest', 'show me'
  ];
  return searchKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

function formatSearchResponse(searchResults: any[]): string {
  // Implement formatting logic for search results
  throw new Error('Not implemented');
} 