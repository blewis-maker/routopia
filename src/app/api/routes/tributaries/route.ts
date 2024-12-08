import { NextResponse } from 'next/server';
import { RouteAIService } from '@/services/route/RouteAIService';

const routeAI = new RouteAIService();

export async function POST(request: Request) {
  try {
    const { poiId, mainRoute, preferences } = await request.json();

    const tributaryRoutes = await routeAI.generateTributaryRoutes(
      poiId,
      mainRoute,
      preferences
    );

    return NextResponse.json({ routes: tributaryRoutes });
  } catch (error) {
    console.error('Tributary routes API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tributary routes' },
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