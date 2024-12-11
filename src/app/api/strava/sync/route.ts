import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ActivitySyncService } from '@/services/activities/sync/ActivitySyncService';
import { ErrorLogger } from '@/lib/utils/errors/ErrorLogger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const syncService = new ActivitySyncService();
    await syncService.syncUserActivities(session.user.id, 'strava');

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    await ErrorLogger.log(error as Error, {
      operation: 'strava_sync',
      severity: 'high'
    });
    
    return NextResponse.json(
      { error: 'Failed to sync activities' },
      { status: 500 }
    );
  }
} 