import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { place_name, center_lat, center_lng, locationType } = body;

  try {
    await prisma.recentLocation.create({
      data: {
        userId: session.user.id,
        place_name,
        center_lat,
        center_lng,
        locationType
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save recent location:', error);
    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [startLocations, destLocations] = await Promise.all([
      prisma.recentLocation.findMany({
        where: {
          userId: session.user.id,
          locationType: 'start'
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      }),
      prisma.recentLocation.findMany({
        where: {
          userId: session.user.id,
          locationType: 'destination'
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      })
    ]);

    return NextResponse.json({ startLocations, destLocations });
  } catch (error) {
    console.error('Failed to fetch recent locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
} 