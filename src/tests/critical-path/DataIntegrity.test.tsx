import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DataService } from '@/services/data/DataService';
import { RouteService } from '@/services/routes/RouteService';
import { UserPreferences } from '@/services/user/UserPreferences';

describe('Critical - Data Integrity', () => {
  let dataService: DataService;
  let routeService: RouteService;
  let userPreferences: UserPreferences;

  beforeEach(() => {
    dataService = new DataService();
    routeService = new RouteService();
    userPreferences = new UserPreferences();
    vi.clearAllMocks();
  });

  test('route data persistence', async () => {
    const testRoute = {
      id: 'route-123',
      name: 'Test Route',
      waypoints: [[0, 0], [1, 1]]
    };

    // Save route
    await routeService.saveRoute(testRoute);

    // Verify persistence
    const savedRoute = await routeService.getRoute(testRoute.id);
    expect(savedRoute).toMatchObject(testRoute);

    // Verify data integrity
    expect(await dataService.verifyIntegrity(testRoute.id)).toBe(true);
  });

  test('user preferences saving', async () => {
    const testPreferences = {
      theme: 'dark',
      units: 'metric',
      mapStyle: 'satellite'
    };

    // Save preferences
    await userPreferences.savePreferences(testPreferences);

    // Verify persistence
    const savedPrefs = await userPreferences.getPreferences();
    expect(savedPrefs).toMatchObject(testPreferences);

    // Test defaults
    await userPreferences.clear();
    const defaults = await userPreferences.getPreferences();
    expect(defaults.theme).toBe('light');
  });
}); 