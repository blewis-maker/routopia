import { vi } from 'vitest';
import { MapboxManager } from '@/services/maps/MapboxManager';
import { GoogleMapsManager } from '@/services/maps/GoogleMapsManager';
import { RouteCache } from '@/services/cache/RouteCache';
import { TrafficCache } from '@/services/cache/TrafficCache';
import { MapTileCache } from '@/services/cache/MapTileCache';

export class TestEnvironment {
  private mockManagers: {
    mapbox: MapboxManager;
    google: GoogleMapsManager;
  };

  private mockCaches: {
    route: RouteCache;
    traffic: TrafficCache;
    tile: MapTileCache;
  };

  constructor() {
    this.mockManagers = {
      mapbox: vi.mocked(MapboxManager),
      google: vi.mocked(GoogleMapsManager)
    };

    this.mockCaches = {
      route: vi.mocked(RouteCache),
      traffic: vi.mocked(TrafficCache),
      tile: vi.mocked(MapTileCache)
    };
  }

  async setup(): Promise<void> {
    // Set up test environment
    await this.setupMocks();
    await this.setupTestData();
  }

  async teardown(): Promise<void> {
    // Clean up test environment
    await this.cleanupMocks();
    await this.cleanupTestData();
  }

  private async setupMocks(): Promise<void> {
    // Set up mock implementations
    vi.mock('@/services/maps/MapboxManager');
    vi.mock('@/services/maps/GoogleMapsManager');
    vi.mock('@/services/cache/RouteCache');
    vi.mock('@/services/cache/TrafficCache');
    vi.mock('@/services/cache/MapTileCache');
  }

  getMockManagers(): typeof this.mockManagers {
    return this.mockManagers;
  }

  getMockCaches(): typeof this.mockCaches {
    return this.mockCaches;
  }
} 