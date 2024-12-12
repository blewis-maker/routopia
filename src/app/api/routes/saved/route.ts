import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedRoutes = await prisma.savedRoute.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        name: true,
        startPoint: true,
        endPoint: true,
        distance: true,
        duration: true,
        activityType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(savedRoutes);
  } catch (error) {
    console.error('Error fetching saved routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' }, 
      { status: 500 }
    );
  }
} 