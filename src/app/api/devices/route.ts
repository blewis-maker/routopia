import { NextResponse } from 'next/server';
import type { ConnectedDevice } from '@/types/device';
import { getDevices, addDevice, updateDevice } from '@/services/devices';

export async function GET() {
  try {
    const devices = await getDevices();
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const device: ConnectedDevice = await request.json();
    const newDevice = await addDevice(device);
    return NextResponse.json(newDevice);
  } catch (error) {
    console.error('Failed to add device:', error);
    return NextResponse.json(
      { error: 'Failed to add device' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const device: ConnectedDevice = await request.json();
    const updatedDevice = await updateDevice(device);
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Failed to update device:', error);
    return NextResponse.json(
      { error: 'Failed to update device' },
      { status: 500 }
    );
  }
} 