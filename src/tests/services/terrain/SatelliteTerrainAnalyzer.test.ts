import { SatelliteTerrainAnalyzer } from '@/services/terrain/SatelliteTerrainAnalyzer';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPService } from '@/services/mcp/MCPService';
import { mockPoint, mockWeatherConditions, mockTerrainConditions } from '@/tests/__mocks__/routeMocks';
import { TerrainAnalysisResult } from '@/types/terrain/types';

jest.mock('@/services/terrain/TerrainAnalysisService');
jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/mcp/MCPService');

describe('SatelliteTerrainAnalyzer', () => {
  let analyzer: SatelliteTerrainAnalyzer;
  let mockTerrainService: jest.Mocked<TerrainAnalysisService>;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPService>;

  beforeEach(() => {
    mockTerrainService = new TerrainAnalysisService() as jest.Mocked<TerrainAnalysisService>;
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockMCPService = new MCPService() as jest.Mocked<MCPService>;

    mockTerrainService.getTerrainConditions.mockResolvedValue(mockTerrainConditions);
    mockWeatherService.getCurrentConditions.mockResolvedValue(mockWeatherConditions);

    analyzer = new SatelliteTerrainAnalyzer(
      mockTerrainService,
      mockWeatherService,
      mockMCPService
    );
  });

  describe('analyzeTerrain', () => {
    it('should enhance terrain analysis with satellite data', async () => {
      const result = await analyzer.analyzeTerrain(mockPoint, mockWeatherConditions);

      expect(result).toBeDefined();
      expect(result.surface).toBeDefined();
      expect(result.hazards).toBeDefined();
      expect(result.elevation).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(mockTerrainService.getTerrainConditions).toHaveBeenCalled();
    });

    it('should handle service failures gracefully', async () => {
      mockTerrainService.getTerrainConditions.mockRejectedValue(new Error('Service error'));

      const result = await analyzer.analyzeTerrain(mockPoint, mockWeatherConditions);

      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should adjust analysis based on weather conditions', async () => {
      const rainWeather = {
        ...mockWeatherConditions,
        conditions: ['rain'],
        precipitation: 10
      };

      const result = await analyzer.analyzeTerrain(mockPoint, rainWeather);

      expect(result).toBeDefined();
      expect(result.surface).toBe('wet');
      expect(result.hazards).toContain('wet_surface');
    });

    it('should detect terrain hazards', async () => {
      mockTerrainService.getTerrainConditions.mockResolvedValue({
        ...mockTerrainConditions,
        slope: 30,
        hazards: ['steep_slope', 'loose_surface']
      });

      const result = await analyzer.analyzeTerrain(mockPoint, mockWeatherConditions);

      expect(result).toBeDefined();
      expect(result.hazards).toContain('steep_slope');
      expect(result.hazards).toContain('loose_surface');
    });
  });
}); 