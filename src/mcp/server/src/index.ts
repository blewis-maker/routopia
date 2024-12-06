#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode as MCPErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import Anthropic from '@anthropic-ai/sdk';
import Redis from 'ioredis';
import dotenv from "dotenv";
import { 
  RouteGenerationRequest,
  POIRequest,
  RouteResource,
  ToolResponse,
  ErrorCode,
  createServerError,
  isValidRouteRequest,
  isValidPOIRequest,
  isClaudeResponse,
  isServerError
} from "./types.js";
import logger from './utils/logger';
import { RateLimiter } from './utils/rateLimiter';
import { CircuitBreaker } from './utils/fallback';
import { POIService } from './services/POIService';

dotenv.config();

interface MCPServerConfig {
  port?: number;
  redisUrl?: string;
  anthropicApiKey?: string;
  metricsEnabled?: boolean;
  metricsInterval?: number;
  rateLimitWindow?: number;
  maxRequestsPerWindow?: number;
  burstLimit?: number;
}

interface MCPMetrics {
  requestCount: number;
  errorCount: number;
  latencyMs: number[];
  cacheHits: number;
  cacheMisses: number;
  tokenUsage: number;
  routeGenerationCount: number;
  poiSearchCount: number;
  lastFlush: number;
}

export class MCPServer {
  private server: Server;
  private claude: Anthropic;
  private activeRoutes: Map<string, RouteResource>;
  private redis: Redis;
  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private metrics: MCPMetrics;
  private poiService: POIService;

  constructor(config?: MCPServerConfig) {
    const apiKey = config?.anthropicApiKey || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw createServerError(ErrorCode.INTERNAL_ERROR, "CLAUDE_API_KEY is required");
    }

    this.redis = new Redis(config?.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.rateLimiter = new RateLimiter(
      this.redis,
      config?.rateLimitWindow || 60,
      config?.maxRequestsPerWindow || 1000,
      config?.burstLimit || 50
    );

    this.circuitBreaker = new CircuitBreaker(this.redis, 'claude-api');

    this.server = new Server({
      name: "routopia-mcp-server",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    this.claude = new Anthropic({
      apiKey
    });

    this.activeRoutes = new Map();

    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      latencyMs: [],
      cacheHits: 0,
      cacheMisses: 0,
      tokenUsage: 0,
      routeGenerationCount: 0,
      poiSearchCount: 0,
      lastFlush: Date.now()
    };

    this.poiService = new POIService(this.redis);

    if (config?.metricsEnabled) {
      this.startMetricsCollection(config.metricsInterval || 60000);
    }

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: unknown) => {
      if (isServerError(error)) {
        console.error("[MCP Server Error]", {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
          details: error.details
        });
      } else {
        console.error("[MCP Unknown Error]", error);
      }
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: Array.from(this.activeRoutes.values())
      })
    );

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const resource = this.activeRoutes.get(request.params.uri);
        if (!resource) {
          throw createServerError(
            ErrorCode.INVALID_REQUEST,
            `Unknown resource: ${request.params.uri}`
          );
        }

        if (!resource.context) {
          throw createServerError(
            ErrorCode.INVALID_REQUEST,
            `Resource has no context: ${request.params.uri}`
          );
        }

        try {
          const response = await this.claude.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 2048,
            messages: [{
              role: 'user',
              content: this.buildRoutePrompt(resource.context)
            }]
          });

          if (!isClaudeResponse(response)) {
            throw createServerError(
              ErrorCode.CLAUDE_API_ERROR,
              'Invalid response from Claude API'
            );
          }

          const content = response.content[0];
          if (!content || typeof content.text !== 'string') {
            throw createServerError(
              ErrorCode.CLAUDE_API_ERROR,
              'Invalid content in Claude response'
            );
          }

          return {
            contents: [{
              uri: request.params.uri,
              mimeType: "application/json",
              text: content.text
            }]
          };
        } catch (error) {
          if (error instanceof Anthropic.APIError) {
            throw createServerError(
              ErrorCode.CLAUDE_API_ERROR,
              `Claude API error: ${error.message}`,
              error.status === 429 // retryable if rate limited
            );
          }
          throw error;
        }
      }
    );
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
          {
            name: "generate_route",
            description: "Generate a route between two points",
            inputSchema: {
              type: "object",
              properties: {
                startPoint: {
                  type: "object",
                  properties: {
                    lat: { type: "number" },
                    lng: { type: "number" }
                  },
                  required: ["lat", "lng"]
                },
                endPoint: {
                  type: "object",
                  properties: {
                    lat: { type: "number" },
                    lng: { type: "number" }
                  },
                  required: ["lat", "lng"]
                },
                preferences: {
                  type: "object",
                  properties: {
                    activityType: { type: "string", enum: ["WALK", "RUN", "BIKE"] },
                    avoidHills: { type: "boolean" },
                    preferScenic: { type: "boolean" },
                    maxDistance: { type: "number" }
                  },
                  required: ["activityType"]
                }
              },
              required: ["startPoint", "endPoint", "preferences"]
            }
          },
          {
            name: "find_pois",
            description: "Find points of interest near a location",
            inputSchema: {
              type: "object",
              properties: {
                location: {
                  type: "object",
                  properties: {
                    lat: { type: "number" },
                    lng: { type: "number" }
                  },
                  required: ["lat", "lng"]
                },
                radius: { type: "number", minimum: 100, maximum: 5000 },
                categories: { type: "array", items: { type: "string" } },
                limit: { type: "number", minimum: 1, maximum: 20 }
              },
              required: ["location", "radius"]
            }
          }
        ]
      })
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        switch (request.params.name) {
          case "generate_route":
            return this.handleRouteGeneration(request.params.arguments);
          case "find_pois":
            return this.handlePOISearch(request.params.arguments);
          default:
            throw createServerError(
              ErrorCode.INVALID_REQUEST,
              `Unknown tool: ${request.params.name}`
            );
        }
      }
    );
  }

  private startMetricsCollection(interval: number): void {
    setInterval(() => {
      const now = Date.now();
      const duration = (now - this.metrics.lastFlush) / 1000;

      const avgLatency = this.metrics.latencyMs.length > 0
        ? this.metrics.latencyMs.reduce((a, b) => a + b, 0) / this.metrics.latencyMs.length
        : 0;

      logger.info('MCP Server Metrics', {
        metrics: {
          requests_per_second: this.metrics.requestCount / duration,
          errors_per_second: this.metrics.errorCount / duration,
          average_latency_ms: avgLatency,
          cache_hit_ratio: this.metrics.requestCount > 0
            ? this.metrics.cacheHits / this.metrics.requestCount
            : 0,
          token_usage_per_second: this.metrics.tokenUsage / duration,
          route_generations_per_second: this.metrics.routeGenerationCount / duration,
          poi_searches_per_second: this.metrics.poiSearchCount / duration
        }
      });

      // Reset metrics
      this.metrics = {
        requestCount: 0,
        errorCount: 0,
        latencyMs: [],
        cacheHits: 0,
        cacheMisses: 0,
        tokenUsage: 0,
        routeGenerationCount: 0,
        poiSearchCount: 0,
        lastFlush: now
      };
    }, interval);
  }

  private recordMetrics(startTime: number, type: 'route' | 'poi', tokenUsage: number, isError = false, isCacheHit = false): void {
    const latency = Date.now() - startTime;
    
    this.metrics.requestCount++;
    this.metrics.latencyMs.push(latency);
    this.metrics.tokenUsage += tokenUsage;
    
    if (isError) this.metrics.errorCount++;
    if (isCacheHit) this.metrics.cacheHits++;
    else this.metrics.cacheMisses++;
    
    if (type === 'route') this.metrics.routeGenerationCount++;
    else this.metrics.poiSearchCount++;

    logger.debug('Request metrics', {
      type,
      latency,
      tokenUsage,
      isError,
      isCacheHit
    });
  }

  private async handleClaudeRequest<T>(
    operation: () => Promise<T>,
    context: { type: 'route' | 'poi'; key: string }
  ): Promise<T> {
    const startTime = Date.now();
    let isError = false;
    let isCacheHit = false;

    try {
      if (await this.rateLimiter.isRateLimited(context.key)) {
        throw createServerError(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'Rate limit exceeded',
          true
        );
      }

      if (!await this.circuitBreaker.canRequest()) {
        throw createServerError(
          ErrorCode.SERVICE_UNAVAILABLE,
          'Service temporarily unavailable',
          true
        );
      }

      const result = await operation();
      await this.circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      isError = true;
      if (error instanceof Anthropic.APIError) {
        await this.circuitBreaker.recordFailure();
        throw createServerError(
          ErrorCode.CLAUDE_API_ERROR,
          `Claude API error: ${error.message}`,
          error.status === 429
        );
      }
      throw error;
    } finally {
      this.recordMetrics(startTime, context.type, 0, isError, isCacheHit);
    }
  }

  private async handleRouteGeneration(request: RouteGenerationRequest): Promise<ToolResponse> {
    return this.handleClaudeRequest(
      async () => {
        const response = await this.claude.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: this.buildRoutePrompt(request)
          }]
        });

        if (!isClaudeResponse(response)) {
          throw createServerError(
            ErrorCode.CLAUDE_API_ERROR,
            'Invalid response from Claude API'
          );
        }

        return {
          content: response.content,
          tools: this.getAvailableTools()
        };
      },
      { type: 'route', key: `route:${request.startPoint.lat}:${request.startPoint.lng}` }
    );
  }

  public async handlePOISearch(args: unknown): Promise<ToolResponse> {
    const startTime = Date.now();
    let tokenUsage = 0;
    let isError = false;

    try {
      if (!isValidPOIRequest(args)) {
        isError = true;
        logger.error('Invalid POI request parameters');
        throw createServerError(
          ErrorCode.VALIDATION_ERROR,
          `${ErrorCode.VALIDATION_ERROR}: Invalid POI request parameters`
        );
      }

      logger.info('Searching POIs with Claude', { args });
      const response = await this.claude.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: this.buildPOIPrompt(args)
        }]
      });

      tokenUsage = response.usage?.total_tokens || 0;
      logger.info('Successfully found POIs');

      const result = {
        content: [{
          type: 'text',
          text: response.content[0].text
        }],
        tools: [{
          name: 'search_poi',
          description: 'Search for points of interest',
          inputSchema: {
            type: 'object',
            properties: {
              location: { type: 'object' },
              radius: { type: 'number' },
              categories: { type: 'array' }
            }
          }
        }]
      };

      this.recordMetrics(startTime, 'poi', tokenUsage);
      return result;

    } catch (error) {
      isError = true;
      if (error instanceof Anthropic.APIError) {
        logger.error('Claude API error', { error });
        throw createServerError(
          ErrorCode.CLAUDE_API_ERROR,
          `${ErrorCode.CLAUDE_API_ERROR}: ${error.message}`,
          error.status === 429
        );
      }
      logger.error('Internal server error', { error });
      throw createServerError(
        ErrorCode.INTERNAL_ERROR,
        `${ErrorCode.INTERNAL_ERROR}: Internal server error`,
        false,
        error
      );
    } finally {
      this.recordMetrics(startTime, 'poi', tokenUsage, isError);
    }
  }

  private buildRoutePrompt(request: RouteGenerationRequest): string {
    const { startPoint, endPoint, preferences } = request;
    return `Generate a route from 
      (${startPoint.lat}, ${startPoint.lng}) to 
      (${endPoint.lat}, ${endPoint.lng})
      ${preferences.avoidHills ? 'avoiding hills' : ''}
      ${preferences.maxDistance ? `with maximum distance of ${preferences.maxDistance}m` : ''}
      ${preferences.maxDuration ? `with maximum duration of ${preferences.maxDuration} seconds` : ''}
      ${preferences.includePointsOfInterest ? 'including points of interest' : ''}
      ${preferences.poiCategories?.length ? `with POI categories: ${preferences.poiCategories.join(', ')}` : ''}`;
  }

  private buildPOIPrompt(context: POIRequest): string {
    const { location, radius, categories } = context;
    return `Find points of interest
      near (${location.lat}, ${location.lng})
      within ${radius}m radius
      ${categories?.length ? `in categories: ${categories.join(', ')}` : ''}
      ${context.limit ? `limit to ${context.limit} results` : ''}`;
  }

  public async generateRoute(request: RouteGenerationRequest): Promise<ToolResponse> {
    const includesPOIs = request.preferences.includePointsOfInterest;
    
    if (includesPOIs && request.preferences.poiCategories?.length) {
      // Search for POIs along the route
      const poiRequest: POIRequest = {
        location: request.startPoint,
        radius: 1000, // Default 1km radius
        categories: request.preferences.poiCategories
      };

      try {
        const pois = await this.poiService.searchPOIs(poiRequest);
        // Include POI information in route generation prompt
        return this.handleRouteGeneration({
          ...request,
          metadata: {
            pois: pois.results
          }
        });
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === ErrorCode.NO_RESULTS) {
          // Continue without POIs if none found
          logger.warn('No POIs found for route, continuing without POIs', { request });
          return this.handleRouteGeneration(request);
        }
        throw error;
      }
    }

    return this.handleRouteGeneration(request);
  }

  public async searchPOIs(request: POIRequest): Promise<ToolResponse> {
    return this.handlePOISearch(request);
  }

  public getAvailableTools(): Array<{
    name: string;
    description: string;
    inputSchema: {
      type: 'object';
      properties: Record<string, unknown>;
    };
  }> {
    return [
      {
        name: 'generate_route',
        description: 'Generate a route based on user preferences',
        inputSchema: {
          type: 'object',
          properties: {
            startPoint: { type: 'object' },
            endPoint: { type: 'object' },
            preferences: { type: 'object' }
          }
        }
      },
      {
        name: 'search_poi',
        description: 'Search for points of interest',
        inputSchema: {
          type: 'object',
          properties: {
            location: { type: 'object' },
            radius: { type: 'number' },
            categories: { type: 'array' }
          }
        }
      }
    ];
  }

  public getMetrics(): MCPMetrics {
    return { ...this.metrics };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Routopia MCP server running on stdio");
  }
}

if (require.main === module) {
  const server = new MCPServer();
  server.run().catch(error => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
} 