import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";
import {
  RoutopiaClientConfig,
  RouteContext,
  MCPResponse,
  RouteResourceSchema,
  POIResourceSchema
} from "../types/mcp.types";

export class MCPClientService {
  private client: Client;
  private connected: boolean = false;

  constructor(private config: RoutopiaClientConfig) {
    this.client = new Client({
      name: config.name,
      version: config.version
    }, {
      capabilities: config.capabilities
    });
  }

  async connect() {
    if (this.connected) return;

    const transport = new StdioClientTransport({
      command: process.env.MCP_SERVER_PATH || "mcp-server"
    });

    await this.client.connect(transport);
    this.connected = true;

    // List available resources on connection
    const resources = await this.client.request(
      { method: "resources/list" },
      {
        type: "object",
        properties: {
          resources: { type: "array" }
        }
      }
    );

    console.log("Available MCP resources:", resources);
  }

  async generateRoute(context: RouteContext): Promise<MCPResponse> {
    if (!this.connected) {
      await this.connect();
    }

    // Create a route resource
    const routeResource = await this.client.request(
      {
        method: "resources/create",
        params: {
          type: "route",
          name: `Route ${Date.now()}`,
          context: {
            type: "route",
            data: {
              context,
              preferences: context.preferences,
              constraints: context.constraints
            }
          }
        }
      },
      RouteResourceSchema
    );

    // Request route generation
    const response = await this.client.request(
      {
        method: "llm/generate",
        params: {
          resourceUri: routeResource.uri,
          prompt: this.buildRoutePrompt(context)
        }
      },
      {
        type: "object",
        properties: {
          response: { type: "object" }
        }
      }
    );

    return this.parseResponse(response);
  }

  async suggestPOIs(location: { lat: number; lng: number }, preferences: any): Promise<any> {
    if (!this.connected) {
      await this.connect();
    }

    // Create a POI resource
    const poiResource = await this.client.request(
      {
        method: "resources/create",
        params: {
          type: "poi",
          name: `POI Search ${Date.now()}`,
          context: {
            type: "poi",
            data: {
              location,
              preferences
            }
          }
        }
      },
      POIResourceSchema
    );

    // Request POI suggestions
    const response = await this.client.request(
      {
        method: "llm/generate",
        params: {
          resourceUri: poiResource.uri,
          prompt: this.buildPOIPrompt(location, preferences)
        }
      },
      {
        type: "object",
        properties: {
          suggestions: { type: "array" }
        }
      }
    );

    return response.suggestions;
  }

  private buildRoutePrompt(context: RouteContext): string {
    return `Generate a ${context.preferences.activityType.toLowerCase()} route from 
      (${context.startPoint.lat}, ${context.startPoint.lng}) to 
      (${context.endPoint.lat}, ${context.endPoint.lng})
      ${this.getPreferencesString(context)}
      ${this.getConstraintsString(context)}`;
  }

  private buildPOIPrompt(location: { lat: number; lng: number }, preferences: any): string {
    return `Suggest points of interest near (${location.lat}, ${location.lng})
      matching these preferences: ${JSON.stringify(preferences)}`;
  }

  private getPreferencesString(context: RouteContext): string {
    const prefs = [];
    if (context.preferences.avoidHills) prefs.push('avoiding hills');
    if (context.preferences.preferScenic) prefs.push('preferring scenic routes');
    if (context.preferences.maxDistance) {
      prefs.push(`with maximum distance of ${context.preferences.maxDistance}m`);
    }
    return prefs.length ? 'with preferences: ' + prefs.join(', ') : '';
  }

  private getConstraintsString(context: RouteContext): string {
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

  private parseResponse(response: any): MCPResponse {
    try {
      return response.response as MCPResponse;
    } catch (error) {
      throw new Error('Failed to parse MCP response: ' + (error as Error).message);
    }
  }

  async cleanup(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }
} 