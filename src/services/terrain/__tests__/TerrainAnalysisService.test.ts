import { TerrainAnalysisService } from '../TerrainAnalysisService';
import { MCPIntegrationService } from '@/services/integration/MCPIntegrationService';
import { WeatherService } from '@/services/weather/WeatherService';
import { TerrainFeatureType } from '@/types/terrain';

// Mock dependencies
jest.mock('@/services/integration/MCPIntegrationService');
jest.mock('@/services/weather/WeatherService');

describe('TerrainAnalysisService', () => {
  let terrainService: TerrainAnalysisService;
  let mockMcpService: jest.Mocked<MCPIntegrationService>;
  let mockWeatherService: jest.Mocked<WeatherService>;

  beforeEach(() => {
    mockMcpService = new MCPIntegrationService() as jest.Mocked<MCPIntegrationService>;
    mockWeatherService = new WeatherService(mockMcpService) as jest.Mocked<WeatherService>;
    terrainService = new TerrainAnalysisService(mockMcpService, mockWeatherService);

    // Setup common mock responses
    mockMcpService.getDetailedElevation.mockResolvedValue({
      points: [
        { x: 0, y: 0, elevation: 100 },
        { x: 1, y: 0, elevation: 110 },
        { x: 0, y: 1, elevation: 105 },
        { x: 1, y: 1, elevation: 115 }
      ],
      resolution: 1.0
    });

    mockMcpService.getSurfaceFeatures.mockResolvedValue([
      {
        type: 'vegetation',
        location: { lat: 0, lng: 0 },
        properties: {
          type: 'forest',
          density: 0.8,
          height: 20
        }
      }
    ]);

    mockMcpService.getTerrainComposition.mockResolvedValue({
      materials: [
        {
          type: 'soil',
          friction: 0.6,
          hardness: 0.4,
          permeability: 0.7
        }
      ]
    });

    mockWeatherService.getForecast.mockResolvedValue({
      temperature: 20,
      conditions: ['clear'],
      windSpeed: 10,
      precipitation: 0,
      visibility: 10000
    });
  });

  describe('generate3DTerrainModel', () => {
    it('should generate a valid 3D terrain model', async () => {
      const area = {
        center: { lat: 0, lng: 0 },
        radius: 1000
      };

      const model = await terrainService.generate3DTerrainModel(area);

      expect(model).toHaveProperty('mesh');
      expect(model).toHaveProperty('materials');
      expect(model).toHaveProperty('features');
      expect(model.mesh).toHaveProperty('vertices');
      expect(model.mesh).toHaveProperty('faces');
      expect(model.metadata.resolution).toBe(1.0);
    });

    it('should handle complex terrain features', async () => {
      mockMcpService.getSurfaceFeatures.mockResolvedValueOnce([
        {
          type: 'vegetation',
          location: { lat: 0, lng: 0 },
          properties: { type: 'forest', density: 0.8 }
        },
        {
          type: 'water',
          location: { lat: 0, lng: 1 },
          properties: { type: 'river', flow: 0.5 }
        },
        {
          type: 'structure',
          location: { lat: 1, lng: 0 },
          properties: { type: 'bridge', height: 10 }
        }
      ]);

      const model = await terrainService.generate3DTerrainModel({
        center: { lat: 0, lng: 0 },
        radius: 1000
      });

      expect(model.features).toHaveLength(3);
      expect(model.features[0].type).toBe('vegetation' as TerrainFeatureType);
      expect(model.features[1].type).toBe('water' as TerrainFeatureType);
      expect(model.features[2].type).toBe('structure' as TerrainFeatureType);
    });

    it('should handle elevation data errors gracefully', async () => {
      mockMcpService.getDetailedElevation.mockRejectedValueOnce(
        new Error('Elevation data unavailable')
      );

      await expect(
        terrainService.generate3DTerrainModel({
          center: { lat: 0, lng: 0 },
          radius: 1000
        })
      ).rejects.toThrow('Failed to generate 3D terrain model');
    });
  });

  describe('predictSurfaceQuality', () => {
    it('should predict surface quality with weather impact', async () => {
      const location = { lat: 0, lng: 0 };
      const timeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      mockMcpService.getMaintenanceSchedule.mockResolvedValue({
        location,
        activities: [
          {
            type: 'surface_repair',
            date: '2024-01-03T10:00:00Z',
            duration: '4h',
            impact: {
              accessibility: 0.5,
              quality: 0.8
            }
          }
        ],
        recurring: {
          frequency: 'weekly',
          type: ['inspection'],
          conditions: {
            weather: ['clear'],
            season: ['summer']
          }
        }
      });

      const quality = await terrainService.predictSurfaceQuality(location, timeframe);

      expect(quality.current).toBeGreaterThan(0);
      expect(quality.current).toBeLessThanOrEqual(1);
      expect(quality.forecast).toHaveProperty('trend');
      expect(quality.forecast).toHaveProperty('confidence');
      expect(quality.factors).toBeInstanceOf(Array);
    });

    it('should consider maintenance schedule in quality prediction', async () => {
      const location = { lat: 0, lng: 0 };
      const timeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      };

      mockMcpService.getMaintenanceSchedule.mockResolvedValue({
        location,
        activities: [
          {
            type: 'major_repair',
            date: '2024-01-02T10:00:00Z',
            duration: '8h',
            impact: {
              accessibility: 0.2,
              quality: 0.9
            }
          }
        ],
        recurring: {
          frequency: 'monthly',
          type: ['inspection'],
          conditions: {
            weather: ['clear'],
            season: ['summer']
          }
        }
      });

      const quality = await terrainService.predictSurfaceQuality(location, timeframe);

      expect(quality.forecast.trend).toBe('improving');
      expect(quality.confidence).toBeGreaterThan(0.7);
    });

    it('should handle weather service errors gracefully', async () => {
      mockWeatherService.getForecast.mockRejectedValueOnce(
        new Error('Weather service unavailable')
      );

      await expect(
        terrainService.predictSurfaceQuality(
          { lat: 0, lng: 0 },
          {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-07')
          }
        )
      ).rejects.toThrow('Failed to predict surface quality');
    });
  });

  describe('analyzeTerrainFeatures', () => {
    it('should identify significant terrain features', async () => {
      mockMcpService.getSurfaceFeatures.mockResolvedValueOnce([
        {
          type: 'peak',
          location: { lat: 0, lng: 0 },
          properties: { elevation: 1000, slope: 30 }
        },
        {
          type: 'valley',
          location: { lat: 1, lng: 1 },
          properties: { elevation: 200, width: 500 }
        }
      ]);

      const features = await terrainService.analyzeTerrainFeatures({
        center: { lat: 0, lng: 0 },
        radius: 2000
      });

      expect(features).toHaveLength(2);
      expect(features[0].type).toBe('peak');
      expect(features[1].type).toBe('valley');
    });

    it('should calculate feature properties correctly', async () => {
      mockMcpService.getDetailedElevation.mockResolvedValueOnce({
        points: [
          { x: 0, y: 0, elevation: 100 },
          { x: 1, y: 0, elevation: 200 },
          { x: 0, y: 1, elevation: 150 },
          { x: 1, y: 1, elevation: 250 }
        ],
        resolution: 1.0
      });

      const features = await terrainService.analyzeTerrainFeatures({
        center: { lat: 0, lng: 0 },
        radius: 1000
      });

      features.forEach(feature => {
        expect(feature).toHaveProperty('dimensions');
        expect(feature).toHaveProperty('properties');
        expect(feature.properties).toHaveProperty('elevation');
        expect(feature.properties).toHaveProperty('slope');
      });
    });

    it('should handle missing terrain data gracefully', async () => {
      mockMcpService.getSurfaceFeatures.mockResolvedValueOnce([]);
      mockMcpService.getDetailedElevation.mockResolvedValueOnce({
        points: [],
        resolution: 1.0
      });

      const features = await terrainService.analyzeTerrainFeatures({
        center: { lat: 0, lng: 0 },
        radius: 1000
      });

      expect(features).toHaveLength(0);
    });
  });
}); 