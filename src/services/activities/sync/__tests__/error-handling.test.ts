import { ActivitySyncService } from '../ActivitySyncService';
import { prisma } from '@/lib/prisma';
import { ErrorLog } from '@prisma/client';

describe('Activity Sync Error Handling', () => {
  let syncService: ActivitySyncService;

  beforeEach(() => {
    syncService = new ActivitySyncService(prisma);
  });

  it('should log sync errors', async () => {
    const invalidActivity = { /* invalid data */ };
    
    try {
      await syncService.syncActivity({
        userId: 'test-user',
        provider: 'strava',
        activityData: invalidActivity
      });
    } catch (error) {
      const errorLog = await prisma.errorLog.findFirst({
        where: {
          userId: 'test-user',
          provider: 'strava'
        },
        orderBy: { timestamp: 'desc' }
      });

      expect(errorLog).toBeDefined();
      expect(errorLog?.severity).toBe('error');
    }
  });
}); 