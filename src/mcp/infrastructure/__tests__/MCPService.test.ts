import { MCPService } from '../MCPService';
import { MCPConfig, RouteContext, MCPResponse } from '../../types/mcp.types';
import Redis from 'ioredis';
import Anthropic from '@anthropic-ai/sdk';

// Mock dependencies
jest.mock('ioredis');
jest.mock('@anthropic-ai/sdk');

describe('MCPService', () => {
  let mcpService: MCPService;
  let mockConfig: MCPConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      claude: {
        apiKey: 'test-api-key',
        modelVersion: 'claude-3-opus-20240229',
        maxTokens: 1024
      },
      cache: {
        host: 'localhost',
        port: 6379,
        ttl: 3600
      },
      monitoring: {
        enabled: false,
        metricsInterval: 60000,
        errorThreshold: 0.1
      }
    };

    mcpService = new MCPService(mockConfig);
  });

  describe('generateRoute', () => {
    const mockContext: RouteContext = {
      startPoint: { lat: 40.0150, lng: -105.2705 },
      endPoint: { lat: 40.0177, lng: -105.2805 },
      preferences: {
        activityType: 'WALK',
        preferScenic: true
      }
    };

    const mockResponse: MCPResponse = {
      route: [{
        points: [
          { lat: 40.0150, lng: -105.2705 },
          { lat: 40.0177, lng: -105.2805 }
        ],
        distance: 1000,
        duration: 720,
        elevationGain: 10,
        type: 'SCENIC'
      }],
      metadata: {
        totalDistance: 1000,
        totalDuration: 720,
        totalElevationGain: 10,
        difficulty: 'EASY',
        scenicRating: 4
      }
    };

    it('should generate a route successfully', async () => {
      // Mock Claude response
      (Anthropic.prototype.messages.create as jest.Mock).mockResolvedValueOnce({
        content: [{ text: JSON.stringify(mockResponse) }]
      });

      const result = await mcpService.generateRoute(mockContext);
      
      expect(result).toEqual(mockResponse);
      expect(Anthropic.prototype.messages.create).toHaveBeenCalledTimes(1);
    });

    it('should return cached response if available', async () => {
      // Mock cache hit
      (Redis.prototype.get as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const result = await mcpService.generateRoute(mockContext);
      
      expect(result).toEqual(mockResponse);
      expect(Anthropic.prototype.messages.create).not.toHaveBeenCalled();
    });

    it('should handle Claude API errors gracefully', async () => {
      // Mock Claude API error
      (Anthropic.prototype.messages.create as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );

      await expect(mcpService.generateRoute(mockContext)).rejects.toThrow();
    });

    it('should handle cache errors gracefully', async () => {
      // Mock cache error
      (Redis.prototype.get as jest.Mock).mockRejectedValueOnce(
        new Error('Cache Error')
      );

      // Mock successful Claude response
      (Anthropic.prototype.messages.create as jest.Mock).mockResolvedValueOnce({
        content: [{ text: JSON.stringify(mockResponse) }]
      });

      const result = await mcpService.generateRoute(mockContext);
      
      expect(result).toEqual(mockResponse);
      expect(Anthropic.prototype.messages.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('prompt generation', () => {
    it('should generate correct prompt with preferences', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'BIKE',
          avoidHills: true,
          preferScenic: true,
          maxDistance: 5000
        }
      };

      await mcpService.generateRoute(context);

      const createCall = (Anthropic.prototype.messages.create as jest.Mock).mock.calls[0][0];
      const prompt = createCall.messages[0].content;

      expect(prompt).toContain('Generate a bike route');
      expect(prompt).toContain('avoiding hills');
      expect(prompt).toContain('preferring scenic routes');
      expect(prompt).toContain('maximum distance of 5000m');
    });

    it('should generate correct prompt with constraints', async () => {
      const context: RouteContext = {
        startPoint: { lat: 40.0150, lng: -105.2705 },
        endPoint: { lat: 40.0177, lng: -105.2805 },
        preferences: {
          activityType: 'RUN'
        },
        constraints: {
          maxElevationGain: 100,
          maxDuration: 30,
          requiredPOIs: ['cafe-1', 'park-2']
        }
      };

      await mcpService.generateRoute(context);

      const createCall = (Anthropic.prototype.messages.create as jest.Mock).mock.calls[0][0];
      const prompt = createCall.messages[0].content;

      expect(prompt).toContain('Generate a run route');
      expect(prompt).toContain('maximum elevation gain of 100m');
      expect(prompt).toContain('maximum duration of 30 minutes');
      expect(prompt).toContain('including these POIs: cafe-1, park-2');
    });
  });
}); 