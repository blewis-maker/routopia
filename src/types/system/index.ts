export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

export type PowerMode = 'normal' | 'low' | 'critical';

export interface LocationTrackingConfig {
  enableHighAccuracy: boolean;
  interval: number;
  maximumAge: number;
}

export type TaskPriority = 'high' | 'medium' | 'low'; 