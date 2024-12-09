import { NextResponse } from 'next/server';
import { OpenAIRouteEnhancer } from '@/services/ai/OpenAIRouteEnhancer';
import { RouteContext } from '@/types/chat/types';
import { validateEnv } from '@/lib/env';

export async function POST(request: Request) {
  try {
    // First validate environment variables
    try {
      validateEnv();
    } catch (envError) {
      console.error('Environment validation failed:', envError);
      return NextResponse.json(
        { error: 'Server configuration error: Missing environment variables' },
        { status: 500 }
      );
    }

    // Initialize OpenAI route enhancer
    let routeEnhancer: OpenAIRouteEnhancer;
    try {
      routeEnhancer = new OpenAIRouteEnhancer();
    } catch (initError) {
      console.error('Failed to initialize OpenAI:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize AI service' },
        { status: 500 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { message, context } = body;
    console.log('Received request:', { message, context });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process with OpenAI
    try {
      const routeContext: RouteContext = {
        start: context?.start || 'Unknown',
        end: context?.end || 'Unknown',
        mode: context?.mode || 'car',
        timeOfDay: context?.timeOfDay || new Date().toLocaleTimeString(),
        weather: {
          temperature: context?.weather?.temperature || 0,
          conditions: context?.weather?.conditions || 'unknown',
          windSpeed: context?.weather?.windSpeed || 0
        },
        preferences: context?.preferences || []
      };

      console.log('Processing with context:', routeContext);

      const enhancedRoute = await routeEnhancer.enhanceRoute(routeContext);
      console.log('Enhanced route:', enhancedRoute);

      const suggestions = await routeEnhancer.generateSuggestions(routeContext);
      console.log('Suggestions:', suggestions);

      return NextResponse.json({
        message: enhancedRoute.insights.join('\n') || 'I understand your request. How else can I help?',
        suggestions: suggestions || { waypoints: [], attractions: [], breaks: [] }
      });

    } catch (aiError) {
      console.error('OpenAI processing error:', aiError);
      return NextResponse.json(
        { error: 'Failed to process request with AI service', details: aiError instanceof Error ? aiError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unhandled API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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