import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { place_name, center_lat, center_lng, locationType } = await request.json();

    const savedLocation = await prisma.recentLocation.create({
      data: {
        userId: session.user.id,
        place_name,
        center_lat,
        center_lng,
        locationType,
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, location: savedLocation });
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json(
      { error: 'Failed to save location' },
      { status: 500 }
    );
  }
} 