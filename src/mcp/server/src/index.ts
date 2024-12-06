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

dotenv.config();

interface MCPServerConfig {
  port?: number;
  redisUrl?: string;
  anthropicApiKey?: string;
}

export class MCPServer {
  private server: Server;
  private claude: Anthropic;
  private activeRoutes: Map<string, RouteResource>;

  constructor(config?: MCPServerConfig) {
    const apiKey = config?.anthropicApiKey || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw createServerError(ErrorCode.INTERNAL_ERROR, "CLAUDE_API_KEY is required");
    }

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

  public async handleRouteGeneration(args: unknown): Promise<ToolResponse> {
    if (!isValidRouteRequest(args)) {
      logger.error('Invalid route request parameters');
      throw createServerError(
        ErrorCode.VALIDATION_ERROR,
        `${ErrorCode.VALIDATION_ERROR}: Invalid route request parameters`
      );
    }

    try {
      logger.info('Generating route with Claude', { args });
      const response = await this.claude.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: this.buildRoutePrompt(args)
        }]
      });

      logger.info('Successfully generated route');
      return {
        content: [{
          type: 'text',
          text: response.content[0].text
        }]
      };
    } catch (error) {
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
    }
  }

  public async handlePOISearch(args: unknown): Promise<ToolResponse> {
    if (!isValidPOIRequest(args)) {
      logger.error('Invalid POI request parameters');
      throw createServerError(
        ErrorCode.VALIDATION_ERROR,
        `${ErrorCode.VALIDATION_ERROR}: Invalid POI request parameters`
      );
    }

    try {
      logger.info('Searching POIs with Claude', { args });
      const response = await this.claude.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: this.buildPOIPrompt(args)
        }]
      });

      logger.info('Successfully found POIs');
      return {
        content: [{
          type: 'text',
          text: response.content[0].text
        }]
      };
    } catch (error) {
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
    }
  }

  private buildRoutePrompt(context: RouteGenerationRequest): string {
    const { preferences, startPoint, endPoint } = context;
    return `Generate a ${preferences.activityType} route from 
      (${startPoint.lat}, ${startPoint.lng}) to 
      (${endPoint.lat}, ${endPoint.lng})
      ${preferences.avoidHills ? 'avoiding hills' : ''}
      ${preferences.preferScenic ? 'preferring scenic routes' : ''}
      ${preferences.maxDistance ? `with maximum distance of ${preferences.maxDistance}m` : ''}`;
  }

  private buildPOIPrompt(context: POIRequest): string {
    const { location, radius, categories } = context;
    return `Find points of interest
      near (${location.lat}, ${location.lng})
      within ${radius}m radius
      ${categories?.length ? `in categories: ${categories.join(', ')}` : ''}
      ${context.limit ? `limit to ${context.limit} results` : ''}`;
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