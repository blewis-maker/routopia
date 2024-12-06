import { NextResponse } from 'next/server';
import type { ActivityType } from '@/types/activities';
import { getActivityStats } from '@/services/activities';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ActivityType;
    const timeframe = searchParams.get('timeframe') || 'month';

    if (!type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const stats = await getActivityStats(type, timeframe);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch activity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
} 