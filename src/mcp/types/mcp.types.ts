import { Client, ClientCapabilities } from "@modelcontextprotocol/sdk/client";

export interface RoutopiaClientConfig {
  name: string;
  version: string;
  capabilities: ClientCapabilities;
}

export type ActivityType = 
  | 'WALK' | 'RUN' | 'BIKE' | 'CAR' | 'SKI'
  | 'HIKE' | 'PHOTO' | 'FOOD' | 'TEAM';

export type ActivityCategory =
  | 'FITNESS'
  | 'LEISURE'
  | 'TRANSPORT'
  | 'WINTER_SPORT'
  | 'URBAN_EXPLORATION'
  | 'FAMILY'
  | 'TEAM_BUILDING'
  | 'PHOTOGRAPHY'
  | 'CULINARY';

export interface PreferencesBase {
  activityType: ActivityType;
  activityCategory?: ActivityCategory;
  avoidHills?: boolean;
  preferScenic?: boolean;
  maxDistance?: number;  // in meters
}

export interface TimeConstraints {
  departureTime?: string;
  arrivalTime?: string;
  intermediateStops?: Array<{
    location: string;
    time: string;
    duration?: number;
  }>;
}

export interface CarPreferences {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  preferEconomic?: boolean;
  parkingType?: 'street' | 'garage' | 'lot';
  maxParkingCost?: number;
}

export interface TrainingPreferences {
  targetPower?: number;      // watts
  intervalType?: 'threshold' | 'vo2max' | 'recovery';
  terrainPreference?: 'flat' | 'rolling' | 'climbing';
  trafficPreference?: 'avoid' | 'minimal' | 'any';
}

export interface WinterPreferences {
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferNightSkiing?: boolean;
  requireSnowmaking?: boolean;
  minSnowDepth?: number;     // in cm
  avalancheRisk?: 'low' | 'moderate' | 'high';
}

export interface UrbanPreferences {
  safetyPriority?: 'high' | 'moderate' | 'standard';
  lightingRequired?: boolean;
  maxWalkingDistance?: number;
  preferIndoor?: boolean;
  atmosphereType?: 'quiet' | 'lively' | 'upscale';
}

export interface RoutePreferences extends PreferencesBase {
  timeConstraints?: TimeConstraints;
  carPreferences?: CarPreferences;
  trainingPreferences?: TrainingPreferences;
  winterPreferences?: WinterPreferences;
  urbanPreferences?: UrbanPreferences;
  [key: string]: ActivityType | ActivityCategory | boolean | number | undefined | 
    TimeConstraints | CarPreferences | TrainingPreferences | WinterPreferences | UrbanPreferences;
}

export interface RouteConstraints {
  maxElevationGain?: number;  // in meters
  maxDuration?: number;       // in minutes
  requiredPOIs?: string[];    // POI IDs that must be included
  weatherConstraints?: {
    maxWindSpeed?: number;    // in km/h
    minTemperature?: number;  // in Celsius
    maxTemperature?: number;
    acceptablePrecipitation?: ('none' | 'light' | 'moderate')[];
  };
  timeConstraints?: {
    openingHours?: boolean;
    avoidPeakHours?: boolean;
    maxWaitTime?: number;     // in minutes
  };
}

export interface TripPlanningContext {
  tripType: 'dayTrip' | 'vacation' | 'business' | 'training' | 'event';
  duration: number; // in hours
  budget?: {
    total: number;
    currency: string;
    preferences: {
      lodging?: 'budget' | 'moderate' | 'luxury';
      dining?: 'budget' | 'moderate' | 'luxury';
      activities?: 'budget' | 'moderate' | 'luxury';
    };
  };
  participants?: {
    adults: number;
    children: number;
    preferences: string[];
    skillLevels?: {
      [key in ActivityType]?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    };
  };
  weatherSensitivity?: 'low' | 'medium' | 'high';
}

export interface RouteContext {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: RoutePreferences;
  constraints?: RouteConstraints;
  tripPlanning?: TripPlanningContext;
  currentConditions?: {
    weather: WeatherConditions;
    traffic: TrafficConditions;
    events?: SpecialEvent[];
  };
}

export interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  precipitation: {
    type: 'none' | 'rain' | 'snow';
    intensity: 'none' | 'light' | 'moderate' | 'heavy';
  };
  visibility: number;
  snowDepth?: number;
  avalancheRisk?: 'low' | 'moderate' | 'high';
  sunTimes?: {
    sunrise: string;
    sunset: string;
    goldenHour: string;
    blueMoment: string;
  };
  airQuality?: {
    index: number;
    pollutants: string[];
  };
}

export interface TrafficConditions {
  congestionLevel: 'low' | 'moderate' | 'heavy';
  incidents?: TrafficIncident[];
  averageSpeed: number;
  predictedDelays: number;
  crowdLevels?: {
    parking: 'empty' | 'light' | 'moderate' | 'full';
    pedestrian: 'light' | 'moderate' | 'heavy';
    cycling: 'light' | 'moderate' | 'heavy';
    vehicular: 'light' | 'moderate' | 'heavy';
  };
}

export interface SpecialEvent {
  type: 'sports' | 'concert' | 'festival' | 'construction' | 'closure';
  location: GeoPoint;
  timeRange: {
    start: string;
    end: string;
  };
  impact: 'low' | 'moderate' | 'high';
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MCPResponse {
  route: RouteSegment[];
  metadata: RouteMetadata;
  suggestedPOIs?: POIRecommendation[];
}

export interface RouteSegment {
  points: GeoPoint[];
  distance: number;
  duration: number;
  elevationGain: number;
  activityType: ActivityType;
  segmentType: 'MAIN' | 'TRIBUTARY';
  conditions: {
    weather: WeatherConditions;
    surface: string[];
    difficulty: 'easy' | 'moderate' | 'hard';
    safety: 'low' | 'moderate' | 'high';
  };
  bailoutPoints?: GeoPoint[];
  facilities?: string[];
  timing?: {
    bestTime: string;
    alternatives: string[];
    restrictions?: string[];
  };
}

export interface TributaryRoute {
  id: string;
  activityType: ActivityType;
  startPoint: GeoPoint;  // Connection point to main route
  endPoint: GeoPoint;    // Activity destination
  returnPoint?: GeoPoint; // Optional different return point to main route
  segments: RouteSegment[];
  metadata: {
    totalDistance: number;
    totalDuration: number;
    elevationGain: number;
    difficulty: 'EASY' | 'MODERATE' | 'HARD';
    conditions: {
      weather: WeatherConditions;
      surface: string[];
      safety: 'low' | 'moderate' | 'high';
    };
  };
}

export interface RouteMetadata {
  totalDistance: number;
  totalDuration: number;
  totalElevationGain: number;
  difficulty: 'EASY' | 'MODERATE' | 'HARD';
  scenicRating: number;  // 1-5 scale
  mainRouteType: ActivityType;  // Usually CAR
  tributaryActivities: ActivityType[];
  tributaryMetrics?: {
    [key in ActivityType]?: {
      count: number;
      totalDistance: number;
      totalDuration: number;
    };
  };
  conditions: {
    weather: WeatherConditions;
    traffic?: TrafficConditions;
    events?: SpecialEvent[];
  };
  timing: {
    optimalDepartureTime?: string;
    estimatedArrivalTime?: string;
    peakCongestionTimes?: string[];
    weatherWindows?: Array<{
      start: string;
      end: string;
      conditions: 'optimal' | 'good' | 'fair';
    }>;
  };
  userExperience?: {
    interfaceSettings?: {
      complexity: number;
      assistanceLevel: number;
      informationDensity: number;
    };
    routeSuggestions?: {
      alternatives: number;
      personalization: number;
      confidence: number;
    };
    learningPrompts?: string[];
  };
}

export interface POIRecommendation {
  id: string;
  name: string;
  location: GeoPoint;
  category: string;
  recommendedActivities: ActivityType[];
  confidence: number;
  details: {
    description?: string;
    openingHours: string;
    pricing?: {
      level: 'budget' | 'moderate' | 'premium';
      currency: string;
      range: [number, number];
    };
    amenities: string[];
    ratings?: {
      overall: number;
      aspects?: {
        safety?: number;
        accessibility?: number;
        familyFriendly?: number;
        photography?: number;
        uniqueness?: number;
      };
    };
  };
  schedule?: {
    bestTimes: string[];
    peakHours: string[];
    specialEvents?: Array<{
      name: string;
      time: string;
      duration: number;
    }>;
  };
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

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'closure' | 'event';
  severity: 'low' | 'moderate' | 'high';
  description: string;
  location: GeoPoint;
  startTime: string;
  endTime?: string;
  impactedLanes?: number;
  detour?: GeoPoint[];
}

export interface AIServiceConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  contextWindow: number;
  metricsEnabled: boolean;
  cacheEnabled: boolean;
}

export interface AIRequest {
  route?: RouteSegment[];
  context?: RouteContext;
  type: 'ROUTE_ENHANCEMENT' | 'POI_RECOMMENDATION' | 'ACTIVITY_OPTIMIZATION';
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  route?: RouteSegment[];
  metadata?: Record<string, unknown>;
}

export interface POISearchRequest {
  location: GeoPoint;
  radius: number;
  activityType: ActivityType;
  categories?: string[];
}

export interface WeatherRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: {
    activityType: ActivityType;
    [key: string]: unknown;
  };
}

export interface RouteRequest {
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  preferences: {
    activityType: ActivityType;
    [key: string]: unknown;
  };
} 