import type { ActivityMetrics } from '../types/activities-enhanced';

interface RealTimeMetrics {
  speed: number;
  elevation: number;
  duration: number;
  distance: number;
  timestamp: number;
}

class TrackingService {
  private startTime: number = 0;
  private lastPosition: GeolocationPosition | null = null;
  private totalDistance: number = 0;

  private async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  private calculateDistance(pos1: GeolocationPosition, pos2: GeolocationPosition): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.coords.latitude * Math.PI/180;
    const φ2 = pos2.coords.latitude * Math.PI/180;
    const Δφ = (pos2.coords.latitude - pos1.coords.latitude) * Math.PI/180;
    const Δλ = (pos2.coords.longitude - pos1.coords.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  async getRealtimeMetrics(): Promise<RealTimeMetrics> {
    const currentPosition = await this.getCurrentPosition();
    const currentTime = Date.now();

    if (!this.startTime) {
      this.startTime = currentTime;
      this.lastPosition = currentPosition;
      return {
        speed: 0,
        elevation: currentPosition.coords.altitude || 0,
        duration: 0,
        distance: 0,
        timestamp: currentTime
      };
    }

    // Calculate metrics
    if (this.lastPosition) {
      this.totalDistance += this.calculateDistance(this.lastPosition, currentPosition);
    }

    const duration = (currentTime - this.startTime) / 1000; // in seconds
    const speed = currentPosition.coords.speed || 
                 (this.lastPosition ? 
                  (this.calculateDistance(this.lastPosition, currentPosition) / duration) * 3.6 : 0); // km/h

    this.lastPosition = currentPosition;

    return {
      speed: Number(speed.toFixed(1)),
      elevation: Math.round(currentPosition.coords.altitude || 0),
      duration: Math.round(duration),
      distance: Number((this.totalDistance / 1000).toFixed(2)), // Convert to km
      timestamp: currentTime
    };
  }
}

export const trackingService = new TrackingService();
export const getRealtimeMetrics = () => trackingService.getRealtimeMetrics(); 