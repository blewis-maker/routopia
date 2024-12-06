import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPServer } from '../../index';
import { ErrorCode } from '../../types';
import logger from '../../utils/logger';
import { Anthropic, APIError } from '@anthropic-ai/sdk';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: {
    APIError: class APIError extends Error {
      constructor(message: string, status: number, type: string, raw: any) {
        super(message);
        this.status = status;
        this.type = type;
        this.raw = raw;
      }
    }
  }
}));

class MockAnthropicError extends Error {
  status: number;
  type: string;
  raw: any;
  
  constructor(status: number, message: string, type: string, raw: any) {
    super(message);
    this.status = status;
    this.type = type;
    this.raw = raw;
    this.name = 'APIError';
  }
}

describe('Error Handling', () => {
  let server: MCPServer;
  
  beforeEach(() => {
    server = new MCPServer({
      anthropicApiKey: 'test-key'
    });
    vi.clearAllMocks();
  });

  describe('Claude API Errors', () => {
    it('should handle rate limit errors', async () => {
      const error = new APIError('Rate limit exceeded', {
        status: 429,
        message: 'Rate limit exceeded',
        type: 'rate_limit_error'
      });

      expect(error.status).toBe(429);
      expect(error.type).toBe('rate_limit_error');
    });

    it('should handle authentication errors', async () => {
      const mockError = new Anthropic.APIError(
        'Invalid API key',
        401,
        'authentication_error',
        { message: 'Invalid API key', type: 'authentication_error' }
      );
      (server['claude'].messages.create as jest.Mock).mockRejectedValueOnce(mockError);

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(`${ErrorCode.CLAUDE_API_ERROR}: Invalid API key`);
      expect(logger.error).toHaveBeenCalledWith('Claude API error', { error: mockError });
    });

    it('should handle server errors', async () => {
      const mockError = new Anthropic.APIError(
        'Internal server error',
        500,
        'server_error',
        { message: 'Internal server error', type: 'server_error' }
      );
      (server['claude'].messages.create as jest.Mock).mockRejectedValueOnce(mockError);

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(`${ErrorCode.CLAUDE_API_ERROR}: Internal server error`);
      expect(logger.error).toHaveBeenCalledWith('Claude API error', { error: mockError });
    });
  });

  describe('Validation Errors', () => {
    it('should handle missing required fields', async () => {
      const request = {
        startPoint: { lat: 37.7749 }, // Missing lng
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(ErrorCode.VALIDATION_ERROR);
      expect(logger.error).toHaveBeenCalledWith('Invalid route request parameters');
    });

    it('should handle missing preferences', async () => {
      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 }
        // Missing preferences
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(ErrorCode.VALIDATION_ERROR);
      expect(logger.error).toHaveBeenCalledWith('Invalid route request parameters');
    });

    it('should handle invalid data types', async () => {
      const request = {
        startPoint: { lat: '37.7749', lng: -122.4194 }, // lat should be number
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(ErrorCode.VALIDATION_ERROR);
      expect(logger.error).toHaveBeenCalledWith('Invalid route request parameters');
    });
  });

  describe('Network Errors', () => {
    it('should handle timeout errors', async () => {
      const mockError = new Error('Request timed out');
      (server['claude'].messages.create as jest.Mock).mockRejectedValueOnce(mockError);

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(`${ErrorCode.INTERNAL_ERROR}: Internal server error`);
      expect(logger.error).toHaveBeenCalledWith('Internal server error', { error: mockError });
    });

    it('should handle network connectivity errors', async () => {
      const mockError = new Error('Network error');
      (server['claude'].messages.create as jest.Mock).mockRejectedValueOnce(mockError);

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      await expect(server.handleRouteGeneration(request))
        .rejects
        .toThrow(`${ErrorCode.INTERNAL_ERROR}: Internal server error`);
      expect(logger.error).toHaveBeenCalledWith('Internal server error', { error: mockError });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary Claude API outages', async () => {
      const mockErrors = [
        new Anthropic.APIError(503, 'Service unavailable', 'server_error', {}),
        new Anthropic.APIError(503, 'Service unavailable', 'server_error', {}),
        { content: [{ text: 'Success' }] }
      ];
      
      let callCount = 0;
      (server['claude'].messages.create as jest.Mock).mockImplementation(() => {
        const result = mockErrors[callCount];
        callCount++;
        if (result instanceof Error) throw result;
        return Promise.resolve(result);
      });

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      const response = await server.handleRouteGeneration(request);
      expect(response).toBeDefined();
      expect(callCount).toBe(3);
      expect(logger.error).toHaveBeenCalledTimes(2);
    });

    it('should handle partial API responses gracefully', async () => {
      const incompleteResponse = {
        content: [{ text: 'Partial response...' }],
        isComplete: false
      };
      
      (server['claude'].messages.create as jest.Mock)
        .mockResolvedValueOnce(incompleteResponse)
        .mockResolvedValueOnce({ content: [{ text: 'Complete response' }] });

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      const response = await server.handleRouteGeneration(request);
      expect(response).toBeDefined();
      expect(response.content[0].text).toBe('Complete response');
      expect(logger.warn).toHaveBeenCalledWith('Received incomplete response, retrying');
    });

    it('should implement exponential backoff for retries', async () => {
      const mockError = new Anthropic.APIError(429, 'Rate limit exceeded', 'rate_limit_error', {});
      
      // Mock multiple failures followed by success
      (server['claude'].messages.create as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ content: [{ text: 'Success' }] });

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      const startTime = Date.now();
      const response = await server.handleRouteGeneration(request);
      const duration = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(duration).toBeGreaterThan(300); // Minimum time for exponential backoff
      expect(logger.info).toHaveBeenCalledWith('Retrying request with exponential backoff');
    });

    it('should respect rate limit headers', async () => {
      const mockError = new Anthropic.APIError(429, 'Rate limit exceeded', 'rate_limit_error', {
        headers: {
          'retry-after': '2'
        }
      });

      (server['claude'].messages.create as jest.Mock)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ content: [{ text: 'Success' }] });

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      const startTime = Date.now();
      const response = await server.handleRouteGeneration(request);
      const duration = Date.now() - startTime;

      expect(response).toBeDefined();
      expect(duration).toBeGreaterThan(2000); // Should wait at least 2 seconds
      expect(logger.info).toHaveBeenCalledWith('Respecting rate limit retry-after header: 2s');
    });

    it('should handle concurrent request failures gracefully', async () => {
      const mockError = new Anthropic.APIError(429, 'Rate limit exceeded', 'rate_limit_error', {});
      
      // First request succeeds, subsequent ones fail with rate limit
      (server['claude'].messages.create as jest.Mock)
        .mockResolvedValueOnce({ content: [{ text: 'Success' }] })
        .mockRejectedValue(mockError);

      const request = {
        startPoint: { lat: 37.7749, lng: -122.4194 },
        endPoint: { lat: 37.3382, lng: -121.8863 },
        preferences: { activityType: 'WALK' }
      };

      const results = await Promise.allSettled([
        server.handleRouteGeneration(request),
        server.handleRouteGeneration(request),
        server.handleRouteGeneration(request)
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results.slice(1).every(r => r.status === 'rejected')).toBe(true);
      expect(logger.error).toHaveBeenCalledTimes(2);
    });
  });
}); 