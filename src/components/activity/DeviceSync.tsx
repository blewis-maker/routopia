import { useState, useEffect } from 'react';
import type { ConnectedDevice } from '@/types';

interface SyncStatus {
  deviceId: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync?: string;
  error?: string;
}

export function DeviceSync() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
        
        // Initialize sync status for each device
        const initialStatus: Record<string, SyncStatus> = {};
        data.forEach((device: ConnectedDevice) => {
          initialStatus[device.id] = {
            deviceId: device.id,
            status: 'idle',
            lastSync: device.lastSync
          };
        });
        setSyncStatus(initialStatus);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleSync = async (deviceId: string) => {
    // Update status to syncing
    setSyncStatus(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], status: 'syncing' }
    }));

    try {
      // Start sync process
      const response = await fetch(`/api/devices/${deviceId}/sync`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();
      
      // Update status to success
      setSyncStatus(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          status: 'success',
          lastSync: new Date().toISOString()
        }
      }));

      // Update device list with new sync time
      setDevices(devices.map(device => 
        device.id === deviceId 
          ? { ...device, lastSync: new Date().toISOString() }
          : device
      ));
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          status: 'error',
          error: error instanceof Error ? error.message : 'Sync failed'
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-stone-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Device Sync</h2>
        
        <button
          onClick={() => window.location.href = '/devices/connect'}
          className="px-4 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors"
        >
          Add Device
        </button>
      </div>

      <div className="space-y-4">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p>No devices connected</p>
            <p className="text-sm mt-2">
              Connect your devices to sync activities and track your progress
            </p>
          </div>
        ) : (
          devices.map((device) => {
            const status = syncStatus[device.id];
            return (
              <div
                key={device.id}
                className="bg-stone-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{device.name}</h3>
                    <p className="text-sm text-stone-400">
                      Last synced: {status.lastSync 
                        ? new Date(status.lastSync).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {status.status === 'syncing' ? (
                      <div className="flex items-center text-stone-300">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent mr-2"></div>
                        Syncing...
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSync(device.id)}
                        className={`px-4 py-1 rounded transition-colors ${
                          status.status === 'error'
                            ? 'bg-red-600 hover:bg-red-500'
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        } text-white`}
                      >
                        {status.status === 'error' ? 'Retry Sync' : 'Sync Now'}
                      </button>
                    )}
                  </div>
                </div>

                {status.error && (
                  <p className="mt-2 text-sm text-red-500">
                    Error: {status.error}
                  </p>
                )}

                {device.batteryLevel !== undefined && (
                  <div className="mt-2 flex items-center text-sm text-stone-400">
                    <span className="mr-2">Battery:</span>
                    <div className="w-20 h-3 bg-stone-600 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${device.batteryLevel}%`,
                          backgroundColor: device.batteryLevel > 20 ? '#10b981' : '#ef4444'
                        }}
                      />
                    </div>
                    <span className="ml-2">{device.batteryLevel}%</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 