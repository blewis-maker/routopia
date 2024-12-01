import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { testRouteGPT } from '@/lib/gpt/routeGPT';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in chat:', session);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received chat request:', body);

    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let destination: string | undefined;
    const response = await testRouteGPT(
      {
        message: body.message,
        location: body.location
      },
      (dest) => {
        destination = dest;
      }
    );
    
    if (!response) {
      throw new Error('No response from RouteGPT');
    }

    return NextResponse.json({ 
      message: response,
      destination,
      timestamp: new Date().toISOString(),
      location: body.location
    });

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