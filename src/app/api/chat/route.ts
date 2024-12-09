import { NextResponse } from 'next/server';
import { OpenAIRouteEnhancer } from '@/services/ai/OpenAIRouteEnhancer';
import { RouteContext } from '@/types/chat/types';
import { validateEnv } from '@/lib/env';

export async function POST(request: Request) {
  console.log('API route called');
  
  try {
    // First validate environment variables
    try {
      validateEnv();
      console.log('Environment validated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Environment validation failed:', message);
      return NextResponse.json(
        { error: `Server configuration error: ${message}` },
        { status: 500 }
      );
    }

    // Initialize OpenAI route enhancer
    let routeEnhancer: OpenAIRouteEnhancer;
    try {
      routeEnhancer = new OpenAIRouteEnhancer();
      console.log('OpenAI route enhancer initialized');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize OpenAI:', message);
      return NextResponse.json(
        { error: `AI service initialization failed: ${message}` },
        { status: 500 }
      );
    }
    
    // Parse request body
    let body;
    try {
      const text = await request.text();
      console.log('Raw request body:', text);
      body = JSON.parse(text);
      console.log('Parsed request body:', body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to parse request body:', message);
      return NextResponse.json(
        { error: 'Invalid request body', details: message },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { message, context } = body as { message?: string; context?: any };
    console.log('Processing request:', { message, context });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
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
          temperature: Number(context?.weather?.temperature) || 0,
          conditions: String(context?.weather?.conditions) || 'unknown',
          windSpeed: Number(context?.weather?.windSpeed) || 0
        },
        preferences: Array.isArray(context?.preferences) ? context.preferences : []
      };

      console.log('Calling OpenAI with context:', routeContext);

      const enhancedRoute = await routeEnhancer.enhanceRoute(routeContext);
      console.log('OpenAI route response:', enhancedRoute);

      const suggestions = await routeEnhancer.generateSuggestions(routeContext);
      console.log('OpenAI suggestions response:', suggestions);

      if (!enhancedRoute || !Array.isArray(enhancedRoute.insights)) {
        throw new Error('Invalid response from AI service');
      }

      const response = {
        message: enhancedRoute.insights.join('\n') || 'I understand your request. How else can I help?',
        suggestions: suggestions || { waypoints: [], attractions: [], breaks: [] }
      };

      console.log('Sending response:', response);
      return NextResponse.json(response);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenAI processing error:', message);
      return NextResponse.json(
        { 
          error: 'AI Service Error', 
          message,
          details: process.env.NODE_ENV === 'development' ? message : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unhandled API error:', message);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message,
        details: process.env.NODE_ENV === 'development' ? message : undefined
      },
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