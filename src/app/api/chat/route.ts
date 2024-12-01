import { NextResponse } from 'next/server';
import { testRouteGPT } from '@/lib/gpt/routeGPT';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received chat request:', body); // Debug log

    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await testRouteGPT({
      message: body.message,
      location: body.location
    });
    
    if (!response) {
      throw new Error('No response from RouteGPT');
    }

    return NextResponse.json({ message: response });

  } catch (error: any) {
    console.error('Chat API error:', error);
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