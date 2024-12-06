import { useState, useEffect } from 'react';
import type { ConnectedDevice } from '@/types';

export function DeviceManagement() {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
        setSyncEnabled(data.some(device => device.syncEnabled));
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleDeviceSync = async (deviceId: string, enabled: boolean) => {
    try {
      await fetch(`/api/devices/${deviceId}/sync`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      setDevices(devices.map(device => 
        device.id === deviceId 
          ? { ...device, syncEnabled: enabled }
          : device
      ));
    } catch (error) {
      console.error('Failed to update device sync:', error);
    }
  };

  const handleDeviceRemove = async (deviceId: string) => {
    try {
      await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE'
      });

      setDevices(devices.filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('Failed to remove device:', error);
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
        <h2 className="text-xl font-semibold text-white">Connected Devices</h2>
        
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
          devices.map((device) => (
            <div
              key={device.id}
              className="bg-stone-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">{device.name}</h3>
                  <p className="text-sm text-stone-400">
                    Last synced: {device.lastSync 
                      ? new Date(device.lastSync).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={device.syncEnabled}
                      onChange={(e) => handleDeviceSync(device.id, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      device.syncEnabled ? 'bg-emerald-600' : 'bg-stone-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        device.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                    <span className="ml-2 text-sm text-stone-300">
                      Auto-sync
                    </span>
                  </label>

                  <button
                    onClick={() => handleDeviceRemove(device.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>

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
          ))
        )}
      </div>
    </div>
  );
} 