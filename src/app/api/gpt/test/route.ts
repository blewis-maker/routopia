import { NextResponse } from 'next/server';
import { testRouteGPT } from '@/lib/gpt/routeGPT';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const response = await testRouteGPT(prompt);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to test GPT integration' },
      { status: 500 }
    );
  }
} 