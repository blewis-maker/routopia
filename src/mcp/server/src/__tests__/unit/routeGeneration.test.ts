import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import { RouteGenerationRequest, ErrorCode } from '../../types';
import logger from '../../utils/logger';
import Anthropic from '@anthropic-ai/sdk';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Route Generation', () => {
  let server: MCPServer;
  
  beforeEach(() => {
    server = new MCPServer();
  });

  it('should handle valid route generation request', async () => {
    const request: RouteGenerationRequest = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'WALK',
        avoidHills: false,
        preferScenic: false,
        maxDistance: 5000
      }
    };

    const response = await server.handleRouteGeneration(request);
    expect(response).toBeDefined();
    expect(response.content).toBeInstanceOf(Array);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle invalid route generation request', async () => {
    const invalidRequest = {
      startPoint: { lat: 37.7749 }, // Missing lng
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'WALK'
      }
    };

    await expect(server.handleRouteGeneration(invalidRequest as any))
      .rejects
      .toThrow(`${ErrorCode.VALIDATION_ERROR}: Invalid route request parameters`);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle Claude API errors gracefully', async () => {
    // Mock Claude API to throw an error
    const mockError = new Anthropic.APIError('Rate limit exceeded', 429);
    (Anthropic as any).mockCreate.mockRejectedValueOnce(mockError);

    const request: RouteGenerationRequest = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'RUN',
        preferScenic: true,
        maxDistance: 10000
      }
    };

    await expect(server.handleRouteGeneration(request))
      .rejects
      .toThrow(`${ErrorCode.CLAUDE_API_ERROR}: Rate limit exceeded`);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should respect route preferences', async () => {
    const request: RouteGenerationRequest = {
      startPoint: { lat: 37.7749, lng: -122.4194 },
      endPoint: { lat: 37.3382, lng: -121.8863 },
      preferences: {
        activityType: 'BIKE',
        avoidHills: true,
        preferScenic: true,
        maxDistance: 15000
      }
    };

    const response = await server.handleRouteGeneration(request);
    expect(response).toBeDefined();
    expect(response.content).toBeInstanceOf(Array);
    
    // Verify preferences were passed to Claude
    expect(server['claude'].messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('BIKE')
          })
        ])
      })
    );
  });
}); 