import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

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

    // Fetch recent locations from database
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

    return NextResponse.json({
      startLocations,
      destLocations,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching recent locations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 