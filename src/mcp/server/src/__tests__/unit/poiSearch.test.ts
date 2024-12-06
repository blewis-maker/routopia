import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import { POIRequest, ErrorCode } from '../../types';
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

describe('POI Search', () => {
  let server: MCPServer;
  
  beforeEach(() => {
    server = new MCPServer();
  });

  it('should handle valid POI search request', async () => {
    const request: POIRequest = {
      location: { lat: 37.7749, lng: -122.4194 },
      radius: 1000,
      categories: ['restaurant', 'cafe'],
      limit: 5
    };

    const response = await server.handlePOISearch(request);
    expect(response).toBeDefined();
    expect(response.content).toBeInstanceOf(Array);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle invalid POI search request', async () => {
    const invalidRequest = {
      location: { lat: 37.7749 }, // Missing lng
      radius: 1000
    };

    await expect(server.handlePOISearch(invalidRequest as any))
      .rejects
      .toThrow(`${ErrorCode.VALIDATION_ERROR}: Invalid POI request parameters`);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle Claude API errors gracefully', async () => {
    // Mock Claude API to throw an error
    const mockError = new Anthropic.APIError('Rate limit exceeded', 429);
    (Anthropic as any).mockCreate.mockRejectedValueOnce(mockError);

    const request: POIRequest = {
      location: { lat: 37.7749, lng: -122.4194 },
      radius: 1000,
      categories: ['restaurant']
    };

    await expect(server.handlePOISearch(request))
      .rejects
      .toThrow(`${ErrorCode.CLAUDE_API_ERROR}: Rate limit exceeded`);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should respect category filters', async () => {
    const request: POIRequest = {
      location: { lat: 37.7749, lng: -122.4194 },
      radius: 1000,
      categories: ['museum', 'park']
    };

    const response = await server.handlePOISearch(request);
    expect(response).toBeDefined();
    expect(response.content).toBeInstanceOf(Array);
    
    // Verify categories were passed to Claude
    expect(server['claude'].messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('museum, park')
          })
        ])
      })
    );
  });

  it('should respect search radius', async () => {
    const request: POIRequest = {
      location: { lat: 37.7749, lng: -122.4194 },
      radius: 500,
      limit: 10
    };

    const response = await server.handlePOISearch(request);
    expect(response).toBeDefined();
    expect(response.content).toBeInstanceOf(Array);
    
    // Verify radius was passed to Claude
    expect(server['claude'].messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('500m radius')
          })
        ])
      })
    );
  });
}); 