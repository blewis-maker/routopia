import { prisma } from '@/lib/prisma';
import { syncDeviceData } from '@/lib/deviceSync';

export type DeviceType = 'WATCH' | 'BIKE_COMPUTER' | 'HEART_RATE_MONITOR';

export type DeviceStatus = 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel?: number;
  manufacturer: string;
  model: string;
  firmwareVersion?: string;
  settings: {
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    autoSync: boolean;
    dataTypes: string[];
    notifications: boolean;
  };
  lastSync?: {
    timestamp: string;
    success: boolean;
    error?: string;
  };
};

export async function getDevices() {
  const devices = await prisma.device.findMany({
    include: {
      settings: true,
      lastSync: true,
    },
  });

  return devices.map(device => ({
    id: device.id,
    name: device.name,
    type: device.type as DeviceType,
    status: device.status as DeviceStatus,
    batteryLevel: device.batteryLevel || undefined,
    manufacturer: device.manufacturer,
    model: device.model,
    firmwareVersion: device.firmwareVersion || undefined,
    settings: {
      syncFrequency: device.settings!.syncFrequency,
      autoSync: device.settings!.autoSync,
      dataTypes: device.settings!.dataTypes,
      notifications: device.settings!.notifications,
    },
    lastSync: device.lastSync ? {
      timestamp: device.lastSync.createdAt.toISOString(),
      success: device.lastSync.success,
      error: device.lastSync.error || undefined,
    } : undefined,
  }));
}

export async function addDevice(device: Omit<Device, 'id' | 'status' | 'lastSync'>) {
  return prisma.device.create({
    data: {
      name: device.name,
      type: device.type,
      status: 'DISCONNECTED',
      manufacturer: device.manufacturer,
      model: device.model,
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion,
      settings: {
        create: {
          syncFrequency: device.settings.syncFrequency,
          autoSync: device.settings.autoSync,
          dataTypes: device.settings.dataTypes,
          notifications: device.settings.notifications,
        },
      },
    },
    include: {
      settings: true,
      lastSync: true,
    },
  });
}

export async function updateDevice(device: Device) {
  const updatedDevice = await prisma.device.update({
    where: { id: device.id },
    data: {
      name: device.name,
      status: device.status,
      batteryLevel: device.batteryLevel,
      firmwareVersion: device.firmwareVersion,
      settings: {
        update: {
          syncFrequency: device.settings.syncFrequency,
          autoSync: device.settings.autoSync,
          dataTypes: device.settings.dataTypes,
          notifications: device.settings.notifications,
        },
      },
    },
    include: {
      settings: true,
      lastSync: true,
    },
  });

  if (device.status === 'CONNECTED' && updatedDevice.settings?.autoSync) {
    await syncDeviceData(updatedDevice);
  }

  return updatedDevice;
}

export async function removeDevice(id: string) {
  return prisma.device.delete({
    where: { id },
  });
}

export async function syncDevice(id: string) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      settings: true,
    },
  });

  if (!device) {
    throw new Error('Device not found');
  }

  await prisma.device.update({
    where: { id },
    data: {
      status: 'SYNCING',
    },
  });

  try {
    await syncDeviceData(device);

    await prisma.device.update({
      where: { id },
      data: {
        status: 'CONNECTED',
        syncs: {
          create: {
            success: true,
            dataTypes: device.settings!.dataTypes,
            recordsCount: 0, // Updated by syncDeviceData
          },
        },
      },
    });
  } catch (error) {
    await prisma.device.update({
      where: { id },
      data: {
        status: 'DISCONNECTED',
        syncs: {
          create: {
            success: false,
            dataTypes: device.settings!.dataTypes,
            recordsCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
    });
    throw error;
  }
} 