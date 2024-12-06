import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService } from '@/services/ai/AIService';
import { MCPIntegrationService } from '@/services/mcp/MCPIntegrationService';
import { WeatherService } from '@/services/mcp/WeatherService';
import { POIService } from '@/services/mcp/POIService';
import { ChatMessage, UserInteractionContext } from '@/mcp/types/mcp-integration.types';
import logger from '@/utils/logger';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.message || !body.context) {
      return NextResponse.json(
        { error: 'Message and context are required' },
        { status: 400 }
      );
    }

    // Initialize services
    const aiService = AIService.getInstance();
    const mcpService = new MCPIntegrationService();
    const weatherService = new WeatherService();
    const poiService = new POIService();

    // Build interaction context
    const userContext: UserInteractionContext = {
      messageHistory: body.messages || [],
      currentRoute: body.context.route,
      userPreferences: body.context.preferences || {},
      sessionContext: {
        startTime: Date.now(),
        location: body.context.location,
        weather: await weatherService.getCurrentWeather(body.context.location),
        activeRoute: body.context.route,
        recentPOIs: await poiService.getNearbyPOIs(body.context.location)
      }
    };

    // Process message through MCP
    const response = await mcpService.processUserInteraction({
      message: body.message,
      context: userContext
    });

    // Log analytics
    logger.info('Chat processed', {
      userId: session.user.id,
      messageType: 'user',
      context: {
        hasRoute: !!body.context.route,
        hasLocation: !!body.context.location
      },
      metrics: {
        tokenUsage: response.metrics?.tokenUsage,
        latency: response.metrics?.latency,
        cached: response.metrics?.cached
      }
    });

    return NextResponse.json({
      message: response.content,
      context: response.updatedContext,
      suggestions: response.suggestions,
      metrics: response.metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Chat API error:', { error });
    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 