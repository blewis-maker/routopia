import { ActivitySyncService } from '../ActivitySyncService';
import { mockStravaActivity } from '@/test/mocks/activities';
import { prisma } from '@/lib/prisma';

describe('ActivitySyncService', () => {
  let syncService: ActivitySyncService;

  beforeEach(() => {
    syncService = new ActivitySyncService(prisma);
  });

  it('should sync new activities', async () => {
    const result = await syncService.syncActivity({
      userId: 'test-user',
      provider: 'strava',
      activityData: mockStravaActivity
    });

    expect(result.status).toBe('success');
    expect(result.activity).toBeDefined();
  });

  it('should handle duplicate activities', async () => {
    // First sync
    await syncService.syncActivity({
      userId: 'test-user',
      provider: 'strava',
      activityData: mockStravaActivity
    });

    // Second sync of same activity
    const result = await syncService.syncActivity({
      userId: 'test-user',
      provider: 'strava',
      activityData: mockStravaActivity
    });

    expect(result.status).toBe('skipped');
  });
}); 