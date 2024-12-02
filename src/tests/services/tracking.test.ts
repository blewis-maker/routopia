import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackingService, getRealtimeMetrics } from '../../services/tracking';

describe('Tracking Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockGeolocation = {
    getCurrentPosition: vi.fn()
  };

  global.navigator.geolocation = mockGeolocation;

  it('should calculate initial metrics correctly', async () => {
    const mockPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        altitude: 100,
        speed: 0
      },
      timestamp: Date.now()
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => 
      success(mockPosition)
    );

    const metrics = await getRealtimeMetrics();
    
    expect(metrics).toEqual({
      speed: 0,
      elevation: 100,
      duration: 0,
      distance: 0,
      timestamp: expect.any(Number)
    });
  });

  it('should calculate distance and speed between points', async () => {
    const positions = [
      {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          altitude: 100,
          speed: 5
        },
        timestamp: Date.now()
      },
      {
        coords: {
          latitude: 51.5076,
          longitude: -0.1280,
          altitude: 110,
          speed: 6
        },
        timestamp: Date.now() + 1000
      }
    ];

    let callCount = 0;
    mockGeolocation.getCurrentPosition.mockImplementation((success) => 
      success(positions[callCount++])
    );

    const firstMetrics = await getRealtimeMetrics();
    const secondMetrics = await getRealtimeMetrics();

    expect(secondMetrics.distance).toBeGreaterThan(0);
    expect(secondMetrics.speed).toBeGreaterThan(0);
  });
}); 