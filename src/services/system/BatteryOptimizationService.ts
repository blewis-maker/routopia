import { BatteryManager } from '@/types/system';

export class BatteryOptimizationService {
  private batteryManager: BatteryManager | null = null;
  private locationUpdateInterval: number = 1000; // Default 1s
  private isHighAccuracyMode: boolean = true;
  private batteryThresholds = {
    low: 0.2, // 20%
    critical: 0.1 // 10%
  };

  constructor() {
    this.initBatteryMonitoring();
  }

  private async initBatteryMonitoring() {
    try {
      if ('getBattery' in navigator) {
        this.batteryManager = await (navigator as any).getBattery();
        this.batteryManager.addEventListener('levelchange', this.handleBatteryChange.bind(this));
      }
    } catch (error) {
      console.warn('Battery status API not supported');
    }
  }

  private handleBatteryChange() {
    if (!this.batteryManager) return;
    
    const level = this.batteryManager.level;
    if (level <= this.batteryThresholds.critical) {
      this.applyCriticalPowerMode();
    } else if (level <= this.batteryThresholds.low) {
      this.applyLowPowerMode();
    } else {
      this.applyNormalPowerMode();
    }
  }

  private applyCriticalPowerMode() {
    this.locationUpdateInterval = 10000; // 10s
    this.isHighAccuracyMode = false;
    this.disableNonEssentialBackgroundTasks();
  }

  private applyLowPowerMode() {
    this.locationUpdateInterval = 5000; // 5s
    this.isHighAccuracyMode = false;
  }

  private applyNormalPowerMode() {
    this.locationUpdateInterval = 1000; // 1s
    this.isHighAccuracyMode = true;
  }

  public getLocationTrackingConfig() {
    return {
      enableHighAccuracy: this.isHighAccuracyMode,
      interval: this.locationUpdateInterval,
      maximumAge: this.locationUpdateInterval
    };
  }

  private disableNonEssentialBackgroundTasks() {
    // Stop non-critical background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.unregister('non-essential-sync');
      });
    }
  }

  public async optimizeBackgroundProcessing(priority: 'high' | 'medium' | 'low') {
    if (!this.batteryManager) return;

    const level = this.batteryManager.level;
    if (level <= this.batteryThresholds.critical && priority !== 'high') {
      return false; // Only allow high priority tasks
    }

    if (level <= this.batteryThresholds.low && priority === 'low') {
      return false; // Defer low priority tasks
    }

    return true;
  }

  public getBatteryStatus() {
    if (!this.batteryManager) return null;
    
    return {
      level: this.batteryManager.level,
      charging: this.batteryManager.charging,
      chargingTime: this.batteryManager.chargingTime,
      dischargingTime: this.batteryManager.dischargingTime
    };
  }
} 