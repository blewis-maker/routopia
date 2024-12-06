import { RealTimeOptimizer } from '@/services/optimization/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPService } from '@/services/mcp/MCPService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { mockPoint, mockPreferences, mockWeatherConditions, mockTerrainConditions } from '@/tests/__mocks__/routeMocks';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/mcp/MCPService');
jest.mock('@/services/terrain/TerrainAnalysisService');
jest.mock('@/services/traffic/TrafficService');

describe('RealTimeOptimizer', () => {
  let optimizer: RealTimeOptimizer;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockMCPService: jest.Mocked<MCPService>;
  let mockTerrainService: jest.Mocked<TerrainAnalysisService>;
  let mockTrafficService: jest.Mocked<TrafficService>;

  beforeEach(() => {
    mockWeatherService = new WeatherService() as jest.Mocked<WeatherService>;
    mockMCPService = new MCPService() as jest.Mocked<MCPService>;
    mockTerrainService = new TerrainAnalysisService() as jest.Mocked<TerrainAnalysisService>;
    mockTrafficService = new TrafficService() as jest.Mocked<TrafficService>;

    mockWeatherService.getCurrentConditions.mockResolvedValue(mockWeatherConditions);
    mockTerrainService.getTerrainConditions.mockResolvedValue(mockTerrainConditions);
    mockTrafficService.getCurrentConditions.mockResolvedValue({
      level: 0.3,
      speed: 40,
      density: 30,
      timestamp: new Date(),
      confidence: 0.9
    });

    optimizer = new RealTimeOptimizer(
      mockWeatherService,
      mockMCPService,
      mockTerrainService,
      mockTrafficService
    );
  });

  describe('optimizeRoute', () => {
    it('should optimize route based on current conditions', async () => {
      const result = await optimizer.optimizeRoute(
        mockPoint,
        { ...mockPoint, latitude: mockPoint.latitude + 0.01 },
        mockPreferences
      );

      expect(result).toBeDefined();
      expect(mockWeatherService.getCurrentConditions).toHaveBeenCalled();
      expect(mockTerrainService.getTerrainConditions).toHaveBeenCalled();
      expect(mockTrafficService.getCurrentConditions).toHaveBeenCalled();
    });

    it('should handle weather service errors gracefully', async () => {
      mockWeatherService.getCurrentConditions.mockRejectedValue(new Error('Weather service error'));

      const result = await optimizer.optimizeRoute(
        mockPoint,
        { ...mockPoint, latitude: mockPoint.latitude + 0.01 },
        mockPreferences
      );

      expect(result).toBeDefined();
      expect(result.warnings).toContain('Weather data unavailable');
    });
  });
}); 