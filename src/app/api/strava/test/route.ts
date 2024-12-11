import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { StravaClient } from '@/lib/external/strava';
import { ErrorLogger } from '@/lib/utils/errors/ErrorLogger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const strava = new StravaClient(session.user.id);
    
    // Get last 30 days of activities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await strava.getActivities(thirtyDaysAgo);

    return NextResponse.json({
      success: true,
      activityCount: activities.length,
      activities: activities.slice(0, 5) // Return first 5 for preview
    });

  } catch (error) {
    await ErrorLogger.log(error as Error, {
      operation: 'strava_test',
      severity: 'high'
    });
    
    return NextResponse.json(
      { error: 'Failed to test Strava integration' },
      { status: 500 }
    );
  }
} 