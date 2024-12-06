import { MCPClientService } from '../MCPClientService';
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import { RoutopiaClientConfig, RouteContext } from '../../types/mcp.types';

jest.mock("@modelcontextprotocol/sdk/client");
jest.mock("@modelcontextprotocol/sdk/client/stdio");

describe('MCPClientService', () => {
  let mcpClientService: MCPClientService;
  let mockConfig: RoutopiaClientConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      name: "routopia-client",
      version: "1.0.0",
      capabilities: {
        resources: true,
        llm: true
      }
    };

    mcpClientService = new MCPClientService(mockConfig);
  });

  describe('connect', () => {
    it('should connect to MCP server successfully', async () => {
      const mockResources = {
        resources: [
          { uri: 'route://test', type: 'route' },
          { uri: 'poi://test', type: 'poi' }
        ]
      };

      (Client.prototype.request as jest.Mock).mockResolvedValueOnce(mockResources);

      await mcpClientService.connect();

      expect(Client.prototype.connect).toHaveBeenCalled();
      expect(Client.prototype.request).toHaveBeenCalledWith(
        { method: 'resources/list' },
        expect.any(Object)
      );
    });

    it('should handle connection errors', async () => {
      (Client.prototype.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      );

      await expect(mcpClientService.connect()).rejects.toThrow('Connection failed');
    });
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

    const mockRouteResource = {
      uri: 'route://test-123',
      type: 'route'
    };

    const mockRouteResponse = {
      response: {
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
      }
    };

    it('should generate route successfully', async () => {
      // Mock resource creation
      (Client.prototype.request as jest.Mock)
        .mockResolvedValueOnce(mockRouteResource)  // resources/create
        .mockResolvedValueOnce(mockRouteResponse); // llm/generate

      const result = await mcpClientService.generateRoute(mockContext);

      expect(result).toEqual(mockRouteResponse.response);
      expect(Client.prototype.request).toHaveBeenCalledTimes(2);
    });

    it('should connect if not connected', async () => {
      // Mock resource creation
      (Client.prototype.request as jest.Mock)
        .mockResolvedValueOnce({ resources: [] })      // resources/list
        .mockResolvedValueOnce(mockRouteResource)      // resources/create
        .mockResolvedValueOnce(mockRouteResponse);     // llm/generate

      const result = await mcpClientService.generateRoute(mockContext);

      expect(result).toEqual(mockRouteResponse.response);
      expect(Client.prototype.connect).toHaveBeenCalled();
    });

    it('should handle route generation errors', async () => {
      (Client.prototype.request as jest.Mock)
        .mockRejectedValueOnce(new Error('Generation failed'));

      await expect(mcpClientService.generateRoute(mockContext))
        .rejects.toThrow('Generation failed');
    });
  });

  describe('suggestPOIs', () => {
    const mockLocation = { lat: 40.0150, lng: -105.2705 };
    const mockPreferences = {
      categories: ['restaurant', 'cafe'],
      radius: 1000
    };

    const mockPOIResource = {
      uri: 'poi://test-123',
      type: 'poi'
    };

    const mockPOIResponse = {
      suggestions: [
        {
          id: 'poi-1',
          name: 'Test Cafe',
          location: { lat: 40.0155, lng: -105.2710 },
          type: 'cafe',
          confidence: 0.9,
          detourDistance: 100
        }
      ]
    };

    it('should suggest POIs successfully', async () => {
      // Mock resource creation and POI suggestion
      (Client.prototype.request as jest.Mock)
        .mockResolvedValueOnce(mockPOIResource)   // resources/create
        .mockResolvedValueOnce(mockPOIResponse);  // llm/generate

      const result = await mcpClientService.suggestPOIs(mockLocation, mockPreferences);

      expect(result).toEqual(mockPOIResponse.suggestions);
      expect(Client.prototype.request).toHaveBeenCalledTimes(2);
    });

    it('should handle POI suggestion errors', async () => {
      (Client.prototype.request as jest.Mock)
        .mockRejectedValueOnce(new Error('POI suggestion failed'));

      await expect(mcpClientService.suggestPOIs(mockLocation, mockPreferences))
        .rejects.toThrow('POI suggestion failed');
    });
  });

  describe('cleanup', () => {
    it('should disconnect when cleanup is called', async () => {
      await mcpClientService.cleanup();
      expect(Client.prototype.disconnect).toHaveBeenCalled();
    });

    it('should handle cleanup errors', async () => {
      (Client.prototype.disconnect as jest.Mock)
        .mockRejectedValueOnce(new Error('Disconnect failed'));

      await expect(mcpClientService.cleanup())
        .rejects.toThrow('Disconnect failed');
    });
  });
}); 