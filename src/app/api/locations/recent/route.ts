import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in recent locations:', session); // Debug log

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // For now, return empty arrays to test the endpoint
    return NextResponse.json({
      startLocations: [],
      destinations: []
    });
  } catch (error) {
    console.error('Error in recent locations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('Saving location:', body); // Debug log

    // Validate the request body
    if (!body.type || !body.coordinates || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving location:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 