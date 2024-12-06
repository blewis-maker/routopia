import { SatelliteDataCache } from '@/services/terrain/SatelliteDataCache';
import { SatelliteImageData, SatelliteAnalysisResult } from '@/types/terrain/satellite';
import { GeoPoint } from '@/types/geo';

describe('SatelliteDataCache', () => {
  let cache: SatelliteDataCache;
  
  const mockLocation: GeoPoint = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  const mockImageData: SatelliteImageData = {
    width: 1000,
    height: 1000,
    channels: 4,
    data: new Uint8Array(1000 * 1000 * 4),
    timestamp: new Date(),
    resolution: 10
  };

  const mockAnalysisResult: SatelliteAnalysisResult = {
    surfaceType: 'urban',
    confidence: 0.95,
    features: ['buildings', 'roads'],
    waterBodies: [],
    vegetation: {
      coverage: 0.2,
      types: ['trees', 'grass']
    },
    timestamp: new Date()
  };

  beforeEach(() => {
    cache = new SatelliteDataCache({
      maxEntries: 10,
      maxAge: 1000, // 1 second for testing
      minResolution: 10,
      maxResolution: 100,
      preloadRadius: 1000
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('basic cache operations', () => {
    it('should store and retrieve satellite data', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      const result = await cache.get(mockLocation, 10);
      
      expect(result).toBeDefined();
      expect(result?.surfaceType).toBe(mockAnalysisResult.surfaceType);
      expect(result?.confidence).toBe(mockAnalysisResult.confidence);
    });

    it('should return null for non-existent data', async () => {
      const result = await cache.get(
        { latitude: 0, longitude: 0 },
        10
      );
      expect(result).toBeNull();
    });

    it('should handle expired data', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      
      // Wait for data to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await cache.get(mockLocation, 10);
      expect(result).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should evict least valuable entries when cache is full', async () => {
      // Fill cache to maximum
      for (let i = 0; i < 15; i++) {
        const location = {
          latitude: mockLocation.latitude + (i * 0.001),
          longitude: mockLocation.longitude + (i * 0.001)
        };
        await cache.set(location, 10, mockImageData, mockAnalysisResult);
      }

      // Check that some entries were evicted
      const firstLocation = {
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude
      };
      const result = await cache.get(firstLocation, 10);
      expect(result).toBeNull();
    });

    it('should update access statistics on get', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      
      // Access the data multiple times
      for (let i = 0; i < 5; i++) {
        await cache.get(mockLocation, 10);
      }

      // Fill cache to force eviction
      for (let i = 0; i < 15; i++) {
        const location = {
          latitude: mockLocation.latitude + (i * 0.001),
          longitude: mockLocation.longitude + (i * 0.001)
        };
        await cache.set(location, 10, mockImageData, mockAnalysisResult);
      }

      // Frequently accessed data should still be in cache
      const result = await cache.get(mockLocation, 10);
      expect(result).toBeDefined();
    });
  });

  describe('preloading', () => {
    it('should trigger preloading for adjacent areas', async () => {
      const preloadSpy = jest.spyOn(cache as any, 'queueBackgroundLoad');
      
      await cache.preload(mockLocation, 10);
      
      expect(preloadSpy).toHaveBeenCalled();
      expect(preloadSpy.mock.calls.length).toBeGreaterThan(1);
    });

    it('should not preload already cached areas', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      
      const preloadSpy = jest.spyOn(cache as any, 'queueBackgroundLoad');
      
      await cache.preload(mockLocation, 10);
      
      expect(preloadSpy).not.toHaveBeenCalledWith(mockLocation, 10);
    });
  });

  describe('error handling', () => {
    it('should handle invalid resolution values', async () => {
      await expect(
        cache.set(mockLocation, -1, mockImageData, mockAnalysisResult)
      ).rejects.toThrow();
    });

    it('should handle invalid image data', async () => {
      const invalidImageData = { ...mockImageData, width: -1 };
      await expect(
        cache.set(mockLocation, 10, invalidImageData, mockAnalysisResult)
      ).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should clean up expired entries', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      
      // Wait for data to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Trigger cleanup
      await (cache as any).cleanup();
      
      const result = await cache.get(mockLocation, 10);
      expect(result).toBeNull();
    });

    it('should update total size after cleanup', async () => {
      await cache.set(mockLocation, 10, mockImageData, mockAnalysisResult);
      
      const initialSize = (cache as any).totalSize;
      
      // Wait for data to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Trigger cleanup
      await (cache as any).cleanup();
      
      expect((cache as any).totalSize).toBeLessThan(initialSize);
    });
  });
}); 