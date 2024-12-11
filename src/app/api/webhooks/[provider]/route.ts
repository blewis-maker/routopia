import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyStravaWebhook } from '@/lib/utils/webhooks/stravaVerifier';
import { ErrorLogger } from '@/lib/utils/errors/ErrorLogger';
import { ActivitySyncService } from '@/services/activities/sync/ActivitySyncService';

const syncService = new ActivitySyncService();

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  try {
    const payload = await req.json();
    const event = await prisma.webhookEvent.create({
      data: {
        provider,
        eventType: payload.object_type,
        payload,
        status: 'pending'
      }
    });

    if (provider === 'strava' && !verifyStravaWebhook(req)) {
      await updateEventStatus(event.id, 'failed', 'Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    await processWebhookEvent(event.id, provider, payload);
    return NextResponse.json({ status: 'success' });

  } catch (error) {
    await ErrorLogger.log(error as Error, {
      provider,
      operation: 'webhook',
      severity: 'high'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(
  eventId: string,
  provider: string,
  payload: any
) {
  try {
    switch (provider) {
      case 'strava':
        await handleStravaWebhook(payload);
        break;
      case 'garmin':
        await handleGarminWebhook(payload);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    await updateEventStatus(eventId, 'processed');
  } catch (error) {
    await updateEventStatus(
      eventId,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

async function handleStravaWebhook(payload: any) {
  const { object_type, aspect_type, object_id, owner_id } = payload;

  switch (object_type) {
    case 'activity':
      await handleStravaActivity(aspect_type, object_id, owner_id);
      break;
    default:
      console.warn(`Unhandled Strava webhook type: ${object_type}`);
  }
}

async function handleStravaActivity(
  aspectType: string,
  activityId: string,
  userId: string
) {
  switch (aspectType) {
    case 'create':
    case 'update':
      await syncService.syncUserActivities(userId, 'strava');
      break;
    case 'delete':
      await prisma.activity.delete({
        where: {
          provider_activityId: {
            provider: 'strava',
            activityId
          }
        }
      });
      break;
  }
}

async function handleGarminWebhook(payload: any) {
  // Implement Garmin webhook handling
}

async function updateEventStatus(
  eventId: string,
  status: string,
  error?: string
) {
  await prisma.webhookEvent.update({
    where: { id: eventId },
    data: {
      status,
      error,
      processedAt: new Date()
    }
  });
}