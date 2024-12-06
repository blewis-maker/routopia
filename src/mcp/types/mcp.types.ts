import { Client, ClientCapabilities } from "@modelcontextprotocol/sdk/client";

export interface RoutopiaClientConfig {
  name: string;
  version: string;
  capabilities: ClientCapabilities;
}

export interface RouteContext {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: RoutePreferences;
  constraints?: RouteConstraints;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RoutePreferences {
  activityType: 'WALK' | 'RUN' | 'BIKE';
  avoidHills?: boolean;
  preferScenic?: boolean;
  maxDistance?: number;  // in meters
}

export interface RouteConstraints {
  maxElevationGain?: number;  // in meters
  maxDuration?: number;       // in minutes
  requiredPOIs?: string[];    // POI IDs that must be included
}

export interface MCPResponse {
  route: RouteSegment[];
  metadata: RouteMetadata;
  suggestedPOIs?: POIRecommendation[];
}

export interface RouteSegment {
  points: GeoPoint[];
  distance: number;      // in meters
  duration: number;      // in seconds
  elevationGain: number; // in meters
  type: 'NORMAL' | 'SCENIC' | 'POI_DETOUR';
}

export interface RouteMetadata {
  totalDistance: number;
  totalDuration: number;
  totalElevationGain: number;
  difficulty: 'EASY' | 'MODERATE' | 'HARD';
  scenicRating: number;  // 1-5 scale
}

export interface POIRecommendation {
  id: string;
  name: string;
  location: GeoPoint;
  type: string;
  confidence: number;    // 0-1 scale
  detourDistance: number; // Additional distance in meters
}

// MCP Resource Schemas
export const RouteResourceSchema = {
  type: "object",
  properties: {
    uri: { type: "string" },
    name: { type: "string" },
    context: { type: "object", properties: {
      type: { type: "string", enum: ["route"] },
      data: { type: "object", properties: {
        context: { type: "object" },
        response: { type: "object" }
      }}
    }}
  }
};

export const POIResourceSchema = {
  type: "object",
  properties: {
    uri: { type: "string" },
    name: { type: "string" },
    context: { type: "object", properties: {
      type: { type: "string", enum: ["poi"] },
      data: { type: "object", properties: {
        location: { type: "object" },
        details: { type: "object" }
      }}
    }}
  }
}; 