import { RealTimeOptimizer } from '@/services/optimization/RealTimeOptimizer';
import { WeatherService } from '@/services/weather/WeatherService';
import { MCPService } from '@/services/mcp/MCPService';
import { TerrainAnalysisService } from '@/services/terrain/TerrainAnalysisService';
import { TrafficService } from '@/services/traffic/TrafficService';
import { mockPoint, mockPreferences, mockWeatherConditions, mockTerrainConditions, mockSegment } from '@/tests/__mocks__/routeMocks';
import { RouteSegment } from '@/types/route/types';

jest.mock('@/services/weather/WeatherService');
jest.mock('@/services/mcp/MCPService');
jest.mock('@/services/terrain/TerrainAnalysisService');
jest.mock('@/services/traffic/TrafficService');

describe('MultiSegmentRoute', () => {
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

  describe('optimizeMultiSegmentRoute', () => {
    it('should optimize multiple segments', async () => {
      const segments: RouteSegment[] = [
        mockSegment,
        {
          ...mockSegment,
          id: 'segment-2',
          start: { ...mockPoint, latitude: mockPoint.latitude + 0.01 },
          end: { ...mockPoint, latitude: mockPoint.latitude + 0.02 }
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, mockPreferences);

      expect(result).toBeDefined();
      expect(result.length).toBe(segments.length);
      expect(mockWeatherService.getCurrentConditions).toHaveBeenCalled();
      expect(mockTerrainService.getTerrainConditions).toHaveBeenCalled();
      expect(mockTrafficService.getCurrentConditions).toHaveBeenCalled();
    });

    it('should handle service failures gracefully', async () => {
      mockWeatherService.getCurrentConditions.mockRejectedValue(new Error('Weather service error'));

      const segments: RouteSegment[] = [mockSegment];
      const result = await optimizer.optimizeMultiSegmentRoute(segments, mockPreferences);

      expect(result).toBeDefined();
      expect(result[0].warnings).toContain('Weather data unavailable');
    });

    it('should optimize segments with different activity types', async () => {
      const segments: RouteSegment[] = [
        mockSegment,
        {
          ...mockSegment,
          id: 'segment-2',
          type: 'BIKE',
          start: { ...mockPoint, latitude: mockPoint.latitude + 0.01 },
          end: { ...mockPoint, latitude: mockPoint.latitude + 0.02 }
        }
      ];

      const result = await optimizer.optimizeMultiSegmentRoute(segments, {
        ...mockPreferences,
        activityType: 'MIXED'
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(segments.length);
      expect(result[0].type).toBe('WALK');
      expect(result[1].type).toBe('BIKE');
    });
  });
}); 