import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { WeatherService } from '@/services/weather/WeatherService';
import { GeoPoint } from '@/types/geo';
import { 
  TerrainConditions, 
  TerrainMesh, 
  TerrainMaterial,
  SurfaceQualityMetrics,
  TerrainAnalysisResult,
  TerrainPerformanceMetrics
} from '@/types/terrain/types';

describe('Terrain Analysis Integration', () => {
  let terrainService: TerrainAnalysisService;
  let weatherService: WeatherService;

  const mockLocation: GeoPoint = {
    latitude: 40.7128,
    longitude: -74.0060
  };

  beforeEach(() => {
    weatherService = new WeatherService();
    terrainService = new TerrainAnalysisService(weatherService);
  });

  describe('Mesh Generation and Analysis', () => {
    it('should generate terrain mesh with proper LOD levels', async () => {
      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.conditions.mesh).toBeDefined();
      expect(result.conditions.mesh?.lodLevels).toBeGreaterThanOrEqual(2);
      expect(result.conditions.mesh?.vertices.length).toBeGreaterThan(0);
      expect(result.conditions.mesh?.faces.length).toBeGreaterThan(0);
    });

    it('should cache terrain mesh for performance', async () => {
      const startTime = Date.now();
      const firstResult = await terrainService.getTerrainConditions(mockLocation);
      const firstDuration = Date.now() - startTime;

      const secondStartTime = Date.now();
      const secondResult = await terrainService.getTerrainConditions(mockLocation);
      const secondDuration = Date.now() - secondStartTime;

      expect(secondDuration).toBeLessThan(firstDuration);
      expect(secondResult.conditions.mesh).toEqual(firstResult.conditions.mesh);
    });

    it('should handle mesh generation errors gracefully', async () => {
      const invalidLocation: GeoPoint = {
        latitude: 91, // Invalid latitude
        longitude: -74.0060
      };

      await expect(terrainService.getTerrainConditions(invalidLocation))
        .rejects
        .toThrow('Failed to analyze terrain conditions');
    });
  });

  describe('Surface Quality Analysis', () => {
    it('should analyze surface quality with weather impact', async () => {
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['rain'],
        temperature: 15,
        windSpeed: 20,
        visibility: 5000,
        precipitation: 10
      });

      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.conditions.quality).toBeDefined();
      expect(result.conditions.quality.grip).toBeLessThan(1);
      expect(result.conditions.quality.stability).toBeLessThan(1);
      expect(result.conditions.quality.drainage).toBeDefined();
      expect(result.conditions.quality.predictedDegradation).toBeGreaterThan(0);
    });

    it('should predict surface degradation over time', async () => {
      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.conditions.quality.predictedDegradation).toBeDefined();
      expect(result.conditions.quality.nextMaintenance).toBeInstanceOf(Date);
      expect(result.conditions.quality.lastInspection).toBeInstanceOf(Date);
    });

    it('should cache surface quality analysis for performance', async () => {
      const startTime = Date.now();
      const firstResult = await terrainService.getTerrainConditions(mockLocation);
      const firstDuration = Date.now() - startTime;

      const secondStartTime = Date.now();
      const secondResult = await terrainService.getTerrainConditions(mockLocation);
      const secondDuration = Date.now() - secondStartTime;

      expect(secondDuration).toBeLessThan(firstDuration);
      expect(secondResult.conditions.quality).toEqual(firstResult.conditions.quality);
    });
  });

  describe('Risk Assessment', () => {
    it('should identify terrain hazards', async () => {
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['rain', 'wind'],
        temperature: 15,
        windSpeed: 30,
        visibility: 2000,
        precipitation: 20
      });

      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.risks).toBeDefined();
      expect(result.risks.length).toBeGreaterThan(0);
      result.risks.forEach(risk => {
        expect(risk.probability).toBeGreaterThan(0);
        expect(risk.impact).toBeGreaterThan(0);
        expect(risk.mitigations).toBeDefined();
      });
    });

    it('should provide risk mitigation recommendations', async () => {
      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.maintenance).toBeDefined();
      expect(result.recommendations.routing).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should complete analysis within performance targets', async () => {
      const startTime = Date.now();
      const result = await terrainService.getTerrainConditions(mockLocation);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // Complete within 2 seconds
      expect(result.conditions.mesh?.vertices.length).toBeLessThan(10000); // Reasonable vertex count
      expect(result.conditions.mesh?.faces.length).toBeLessThan(20000); // Reasonable face count
    });

    it('should maintain reasonable memory usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      await terrainService.getTerrainConditions(mockLocation);
      const finalMemory = process.memoryUsage().heapUsed;

      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  describe('Weather Integration', () => {
    it('should adjust terrain analysis based on weather conditions', async () => {
      // Test with good weather
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['clear'],
        temperature: 20,
        windSpeed: 5,
        visibility: 10000,
        precipitation: 0
      });

      const goodWeatherResult = await terrainService.getTerrainConditions(mockLocation);

      // Test with bad weather
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue({
        conditions: ['rain', 'wind'],
        temperature: 15,
        windSpeed: 30,
        visibility: 2000,
        precipitation: 20
      });

      const badWeatherResult = await terrainService.getTerrainConditions(mockLocation);

      expect(badWeatherResult.conditions.quality.grip)
        .toBeLessThan(goodWeatherResult.conditions.quality.grip);
      expect(badWeatherResult.conditions.quality.stability)
        .toBeLessThan(goodWeatherResult.conditions.quality.stability);
      expect(badWeatherResult.validUntil.getTime())
        .toBeLessThan(goodWeatherResult.validUntil.getTime());
    });
  });

  describe('Confidence Calculation', () => {
    it('should adjust confidence based on data quality', async () => {
      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should reduce confidence with incomplete data', async () => {
      // Mock weather service to return null
      jest.spyOn(weatherService, 'getWeatherForLocation').mockResolvedValue(null);

      const result = await terrainService.getTerrainConditions(mockLocation);
      
      expect(result.confidence).toBeLessThan(0.8); // Reduced confidence due to missing weather data
    });
  });
}); 