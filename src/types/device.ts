export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'bike_computer' | 'heart_rate_monitor' | 'power_meter';
  lastSync?: string;
  batteryLevel?: number;
  status: 'connected' | 'disconnected' | 'syncing';
  manufacturer: string;
  model: string;
  firmwareVersion?: string;
}

export interface DeviceSettings {
  id: string;
  deviceId: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  autoSync: boolean;
  dataTypes: Array<'activity' | 'heart_rate' | 'power' | 'cadence' | 'location'>;
  notifications: boolean;
}

export interface DeviceSyncResult {
  deviceId: string;
  success: boolean;
  syncedAt: string;
  dataTypes: string[];
  recordsCount: number;
  error?: string;
} 