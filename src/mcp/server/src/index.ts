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

dotenv.config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
if (!CLAUDE_API_KEY) {
  throw createServerError(ErrorCode.INTERNAL_ERROR, "CLAUDE_API_KEY environment variable is required");
}

class RoutopiaServer {
  private server: Server;
  private claude: Anthropic;
  private activeRoutes: Map<string, RouteResource>;

  constructor() {
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
      apiKey: CLAUDE_API_KEY
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

  private async handleRouteGeneration(args: unknown): Promise<ToolResponse> {
    if (!isValidRouteRequest(args)) {
      return {
        content: [{
          type: "text",
          text: "Invalid route request parameters"
        }],
        isError: true
      };
    }

    try {
      const response = await this.claude.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: this.buildRoutePrompt(args)
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
        content: [{
          type: "text",
          text: content.text
        }]
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        return {
          content: [{
            type: "text",
            text: `Route generation failed: ${error.message}`
          }],
          isError: true
        };
      }
      throw error;
    }
  }

  private async handlePOISearch(args: unknown): Promise<ToolResponse> {
    if (!isValidPOIRequest(args)) {
      return {
        content: [{
          type: "text",
          text: "Invalid POI request parameters"
        }],
        isError: true
      };
    }

    try {
      const response = await this.claude.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: this.buildPOIPrompt(args)
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
        content: [{
          type: "text",
          text: content.text
        }]
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        return {
          content: [{
            type: "text",
            text: `POI search failed: ${error.message}`
          }],
          isError: true
        };
      }
      throw error;
    }
  }

  private buildRoutePrompt(context: RouteGenerationRequest): string {
    return `Generate a ${context.preferences.activityType.toLowerCase()} route from 
      (${context.startPoint.lat}, ${context.startPoint.lng}) to 
      (${context.endPoint.lat}, ${context.endPoint.lng})
      ${this.getPreferencesString(context)}
      ${this.getConstraintsString(context)}`;
  }

  private buildPOIPrompt(context: POIRequest): string {
    return `Find points of interest near (${context.location.lat}, ${context.location.lng})
      within ${context.radius} meters
      ${context.categories ? `in categories: ${context.categories.join(', ')}` : ''}
      ${context.limit ? `limit to ${context.limit} results` : ''}`;
  }

  private getPreferencesString(context: RouteGenerationRequest): string {
    const prefs = [];
    if (context.preferences.avoidHills) prefs.push('avoiding hills');
    if (context.preferences.preferScenic) prefs.push('preferring scenic routes');
    if (context.preferences.maxDistance) {
      prefs.push(`with maximum distance of ${context.preferences.maxDistance}m`);
    }
    return prefs.length ? 'with preferences: ' + prefs.join(', ') : '';
  }

  private getConstraintsString(context: RouteGenerationRequest): string {
    if (!context.constraints) return '';
    
    const constraints = [];
    if (context.constraints.maxElevationGain) {
      constraints.push(`maximum elevation gain of ${context.constraints.maxElevationGain}m`);
    }
    if (context.constraints.maxDuration) {
      constraints.push(`maximum duration of ${context.constraints.maxDuration} minutes`);
    }
    if (context.constraints.requiredPOIs?.length) {
      constraints.push(`including these POIs: ${context.constraints.requiredPOIs.join(', ')}`);
    }
    return constraints.length ? 'with constraints: ' + constraints.join(', ') : '';
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Routopia MCP server running on stdio");
  }
}

const server = new RoutopiaServer();
server.run().catch(error => {
  console.error("Server failed to start:", error);
  process.exit(1);
}); 