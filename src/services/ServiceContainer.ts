import { TrailAPIService } from './trail/TrailAPIService';
import { SkiAPIService } from './ski/SkiAPIService';
import { WeatherService } from './weather/WeatherService';
import { CombinedRouteManager } from './route/CombinedRouteManager';
import { GoogleMapsManager } from './maps/GoogleMapsManager';
import { ActivitySyncService } from './activities/sync/ActivitySyncService';
import { RedisService } from '@/services/cache/RedisService';
import { loadGoogleMaps } from '@/lib/maps/GoogleMapsLoader';
import prisma from '@/lib/prisma';

export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private readonly trailService: TrailAPIService;
  private readonly skiService: SkiAPIService;
  private readonly weatherService: WeatherService;
  private mapsService: GoogleMapsManager | null = null;
  private combinedRouteManager: CombinedRouteManager | null = null;
  private activitySyncService: ActivitySyncService | null = null;
  private initialized = false;

  private constructor() {
    // Initialize non-Redis services
    this.trailService = new TrailAPIService();
    this.skiService = new SkiAPIService();
    
    // Only initialize Redis-dependent services on server
    if (typeof window === 'undefined') {
      const redisService = RedisService.getInstance();
      this.weatherService = new WeatherService(redisService.getClient());
      this.activitySyncService = new ActivitySyncService(prisma);
    } else {
      this.weatherService = new WeatherService(null);
      this.activitySyncService = null;
    }
  }

  private async initializeClientServices() {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      await loadGoogleMaps();
      this.mapsService = new GoogleMapsManager();
      
      this.combinedRouteManager = new CombinedRouteManager(
        this.mapsService,
        this.trailService,
        this.skiService
      );

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize client services:', error);
      throw error;
    }
  }

  private async initializeServerServices() {
    if (typeof window !== 'undefined') return;

    try {
      this.activitySyncService = new ActivitySyncService(prisma);
    } catch (error) {
      console.error('Failed to initialize server services:', error);
      throw error;
    }
  }

  static async getInstance(): Promise<ServiceContainer> {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
      
      if (typeof window === 'undefined') {
        await ServiceContainer.instance.initializeServerServices();
      } else if (!ServiceContainer.instance.initialized) {
        await ServiceContainer.instance.initializeClientServices();
      }
    }

    return ServiceContainer.instance;
  }

  getMapsService(): GoogleMapsManager {
    if (!this.mapsService) {
      throw new Error('Maps service not initialized');
    }
    return this.mapsService;
  }

  getCombinedRouteManager(): CombinedRouteManager {
    if (!this.combinedRouteManager) {
      throw new Error('Route manager not initialized');
    }
    return this.combinedRouteManager;
  }

  getTrailService(): TrailAPIService {
    return this.trailService;
  }

  getSkiService(): SkiAPIService {
    return this.skiService;
  }

  getWeatherService(): WeatherService {
    return this.weatherService;
  }

  getActivitySyncService(): ActivitySyncService {
    if (!this.activitySyncService) {
      throw new Error('Activity sync service not initialized');
    }
    return this.activitySyncService;
  }
} 