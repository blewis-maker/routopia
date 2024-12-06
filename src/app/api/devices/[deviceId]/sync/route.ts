import { NextResponse } from 'next/server';
import type { DeviceSyncResult } from '@/types/device';
import { syncDevice } from '@/services/devices';

export async function POST(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params;
    const result: DeviceSyncResult = await syncDevice(deviceId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to sync device:', error);
    return NextResponse.json(
      { error: 'Failed to sync device' },
      { status: 500 }
    );
  }
} 