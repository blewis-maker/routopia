import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { getCachedLocations, setCachedLocations } from '@/lib/redis';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is accessing their own data
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Try to get cached data first
    const [cachedStart, cachedDest] = await Promise.all([
      getCachedLocations(params.userId, 'start'),
      getCachedLocations(params.userId, 'dest')
    ]);

    if (cachedStart && cachedDest) {
      console.log('Returning cached locations');
      return NextResponse.json({
        startLocations: cachedStart,
        destLocations: cachedDest
      });
    }

    // If not cached, fetch from database
    console.log('Fetching locations from database');
    const [startLocations, destLocations] = await Promise.all([
      prisma.recentLocation.findMany({
        where: {
          userId: params.userId,
          locationType: 'START',
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 5,
      }),
      prisma.recentLocation.findMany({
        where: {
          userId: params.userId,
          locationType: 'DESTINATION',
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 5,
      }),
    ]);

    // Cache the results
    await Promise.all([
      setCachedLocations(params.userId, 'start', startLocations),
      setCachedLocations(params.userId, 'dest', destLocations)
    ]);

    return NextResponse.json({
      startLocations,
      destLocations,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in recent-locations route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 