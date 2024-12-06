import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  getDevices,
  addDevice,
  updateDevice,
  syncDevice,
  updateDeviceSettings
} from '../devices';
import type { ConnectedDevice } from '@/types/device';
import { syncDeviceData } from '@/lib/deviceSync';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    device: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn()
    },
    deviceSync: {
      create: vi.fn()
    },
    deviceSettings: {
      update: vi.fn()
    }
  }
}));

vi.mock('@/lib/deviceSync', () => ({
  syncDeviceData: vi.fn()
}));

describe('Devices Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDevices', () => {
    it('should fetch all devices with settings and last sync', async () => {
      const mockDevices = [
        {
          id: '1',
          name: 'Garmin Watch',
          type: 'smartwatch',
          status: 'connected',
          manufacturer: 'Garmin',
          model: 'Forerunner 945',
          settings: {
            syncFrequency: 'daily',
            autoSync: true,
            dataTypes: ['activity', 'heart_rate']
          },
          lastSync: {
            success: true,
            syncedAt: new Date()
          }
        }
      ];

      vi.mocked(prisma.device.findMany).mockResolvedValue(mockDevices);

      const result = await getDevices();

      expect(prisma.device.findMany).toHaveBeenCalledWith({
        include: {
          settings: true,
          lastSync: true
        }
      });

      expect(result).toEqual(mockDevices);
    });
  });

  describe('addDevice', () => {
    it('should create a new device with default settings', async () => {
      const mockDevice: Omit<ConnectedDevice, 'id'> = {
        name: 'Garmin Watch',
        type: 'smartwatch',
        status: 'connected',
        manufacturer: 'Garmin',
        model: 'Forerunner 945'
      };

      const mockCreatedDevice = {
        id: '1',
        ...mockDevice,
        settings: {
          syncFrequency: 'daily',
          autoSync: true,
          dataTypes: ['activity', 'heart_rate'],
          notifications: true
        }
      };

      vi.mocked(prisma.device.create).mockResolvedValue(mockCreatedDevice);

      const result = await addDevice(mockDevice);

      expect(prisma.device.create).toHaveBeenCalledWith({
        data: {
          ...mockDevice,
          settings: {
            create: {
              syncFrequency: 'daily',
              autoSync: true,
              dataTypes: ['activity', 'heart_rate'],
              notifications: true
            }
          }
        },
        include: {
          settings: true,
          lastSync: true
        }
      });

      expect(result).toEqual(mockCreatedDevice);
    });
  });

  describe('syncDevice', () => {
    it('should sync device data and update sync status', async () => {
      const mockDevice = {
        id: '1',
        name: 'Garmin Watch',
        type: 'smartwatch',
        status: 'connected',
        settings: {
          dataTypes: ['activity', 'heart_rate']
        }
      };

      const mockSyncResult = {
        success: true,
        dataTypes: ['activity', 'heart_rate'],
        recordsCount: 5
      };

      vi.mocked(prisma.device.findUnique).mockResolvedValue(mockDevice);
      vi.mocked(syncDeviceData).mockResolvedValue(mockSyncResult);
      vi.mocked(prisma.deviceSync.create).mockResolvedValue({
        id: '1',
        deviceId: '1',
        ...mockSyncResult,
        createdAt: new Date()
      });
      vi.mocked(prisma.device.update).mockResolvedValue({
        ...mockDevice,
        lastSync: new Date()
      });

      const result = await syncDevice('1');

      expect(prisma.device.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          settings: true
        }
      });

      expect(syncDeviceData).toHaveBeenCalledWith(mockDevice);

      expect(prisma.deviceSync.create).toHaveBeenCalledWith({
        data: {
          deviceId: '1',
          success: true,
          dataTypes: ['activity', 'heart_rate'],
          recordsCount: 5,
          error: undefined
        }
      });

      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          lastSync: expect.any(Date),
          status: 'connected'
        }
      });

      expect(result).toEqual({
        deviceId: '1',
        success: true,
        syncedAt: expect.any(String),
        dataTypes: ['activity', 'heart_rate'],
        recordsCount: 5
      });
    });

    it('should handle sync failure', async () => {
      const mockDevice = {
        id: '1',
        name: 'Garmin Watch',
        type: 'smartwatch',
        status: 'connected',
        settings: {
          dataTypes: ['activity', 'heart_rate']
        }
      };

      const mockError = new Error('Sync failed');

      vi.mocked(prisma.device.findUnique).mockResolvedValue(mockDevice);
      vi.mocked(syncDeviceData).mockRejectedValue(mockError);
      vi.mocked(prisma.deviceSync.create).mockResolvedValue({
        id: '1',
        deviceId: '1',
        success: false,
        dataTypes: [],
        recordsCount: 0,
        error: mockError.message,
        createdAt: new Date()
      });

      const result = await syncDevice('1');

      expect(prisma.deviceSync.create).toHaveBeenCalledWith({
        data: {
          deviceId: '1',
          success: false,
          dataTypes: [],
          recordsCount: 0,
          error: 'Sync failed'
        }
      });

      expect(result).toEqual({
        deviceId: '1',
        success: false,
        syncedAt: expect.any(String),
        dataTypes: [],
        recordsCount: 0,
        error: 'Sync failed'
      });
    });
  });

  describe('updateDeviceSettings', () => {
    it('should update device settings', async () => {
      const mockSettings = {
        syncFrequency: 'hourly' as const,
        autoSync: false,
        dataTypes: ['activity', 'heart_rate', 'location'],
        notifications: false
      };

      vi.mocked(prisma.deviceSettings.update).mockResolvedValue({
        id: '1',
        deviceId: '1',
        ...mockSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await updateDeviceSettings('1', mockSettings);

      expect(prisma.deviceSettings.update).toHaveBeenCalledWith({
        where: { deviceId: '1' },
        data: mockSettings
      });

      expect(result).toEqual(expect.objectContaining(mockSettings));
    });
  });
}); 