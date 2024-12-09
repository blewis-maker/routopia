import { NextResponse } from 'next/server';
import { OpenAIRouteEnhancer } from '@/services/ai/OpenAIRouteEnhancer';
import { RouteContext, AIResponse, EnhancedRouteWithSuggestion } from '@/types/chat/types';
import { validateEnv } from '@/lib/env';

// Initialize OpenAI route enhancer
const routeEnhancer = new OpenAIRouteEnhancer();

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

    const routeContext: RouteContext = {
      start: context?.start || 'Unknown',
      end: context?.end || 'Unknown',
      mode: context?.mode || 'car',
      timeOfDay: new Date().toLocaleTimeString(),
      message,
      weather: {
        temperature: context?.weather?.temperature || 0,
        conditions: context?.weather?.conditions || 'unknown',
        windSpeed: context?.weather?.windSpeed || 0
      },
      preferences: []
    };

    try {
      const result = await routeEnhancer.enhanceRoute(routeContext) as EnhancedRouteWithSuggestion;
      
      const response: AIResponse = {
        message: result.insights.join('\n'),
        suggestion: result.suggestion
      };

      return NextResponse.json(response);

    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return NextResponse.json(
        { error: 'Failed to process request with AI service' },
        { status: 500 }
      );
    }

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