import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { verifyStravaWebhook } from '@/lib/utils/webhooks/stravaVerifier';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('hub.challenge');
  
  // Handle Strava webhook verification
  if (challenge) {
    return NextResponse.json({ 'hub.challenge': challenge });
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!verifyStravaWebhook(req)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { object_type, aspect_type, object_id, owner_id } = body;

    switch (object_type) {
      case 'activity':
        await handleActivityWebhook(aspect_type, object_id, owner_id);
        break;
      default:
        console.warn(`Unhandled webhook type: ${object_type}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleActivityWebhook(
  aspectType: string,
  activityId: string,
  userId: string
) {
  const cacheKey = `strava:activity:${activityId}`;

  switch (aspectType) {
    case 'create':
      await redis.setex(cacheKey, 300, JSON.stringify({ status: 'pending' }));
      await prisma.activity.create({
        data: {
          provider: 'strava',
          providerActivityId: activityId,
          userId,
          status: 'pending',
          type: 'unknown',
          name: 'New Activity'
        }
      });
      break;

    case 'update':
      await redis.del(cacheKey);
      break;

    case 'delete':
      await redis.del(cacheKey);
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