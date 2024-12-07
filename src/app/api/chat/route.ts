import { NextResponse } from 'next/server';
import { RouteAIService } from '@/services/route/RouteAIService';

const routeAI = new RouteAIService();

export async function POST(request: Request) {
  try {
    const { message, preferences } = await request.json();

    const response = await routeAI.processUserMessage(message, preferences);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
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