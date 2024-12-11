import { LatLng } from './shared';
import { RouteSegmentType } from './route/types';
import { BikeEquipment, SkiEquipment, RunEquipment, ActivityVariation } from './activities';

export interface RouteSegment {
  type: RouteSegmentType;
  path: LatLng[];
  details: {
    distance: number;
    duration?: number;
    difficulty?: string;
    conditions?: string;
    color?: string;
    trailId?: string;
    resortId?: string;
  };
}

export interface RouteMetadata {
  totalDistance: number;
  totalDuration?: number;
  difficulty?: string;
  technicalFeatures?: string[];
  environmentalFactors?: string[];
  semanticTags?: string[];
  recommendedGear?: string[];

  // Dining & Rest Stops
  dining: {
    preferences: {
      cuisineTypes: string[];      // ['italian', 'mexican', 'cafe']
      priceRange: string[];        // ['$', '$$', '$$$']
      dietaryRestrictions: string[]; // ['vegetarian', 'gluten-free']
      mealTypes: string[];         // ['breakfast', 'lunch', 'dinner', 'snack']
    };
    frequentedPlaces?: {
      placeId: string;
      visitCount: number;
      lastVisited: Date;
      rating: number;              // User's personal rating
    }[];
    avoidPlaces?: string[];       // Place IDs to avoid
  };

  // Recreational Preferences
  recreation: {
    preferences: {
      activityTypes: string[];     // ['hiking', 'photography', 'swimming']
      intensity: string;           // 'low', 'moderate', 'high'
      duration: {
        min: number;               // minutes
        max: number;               // minutes
      };
      timeOfDay: string[];         // ['morning', 'afternoon', 'evening']
    };
    frequentedSpots?: {
      placeId: string;
      activityType: string;
      visitCount: number;
      lastVisited: Date;
      rating: number;
      seasonality: string[];       // ['summer', 'fall']
    }[];
    favorites: {
      trails?: string[];          // Trail IDs
      viewpoints?: string[];      // Viewpoint IDs
      restAreas?: string[];       // Rest area IDs
    };
  };

  // Time & Schedule Preferences
  scheduling: {
    preferredStopFrequency: number;  // minutes between stops
    mealTimes: {
      breakfast?: [number, number];   // [start hour, end hour]
      lunch?: [number, number];
      dinner?: [number, number];
    };
    restStopDuration: {
      short: number;                  // minutes
      long: number;                   // minutes
    };
  };

  // Social Aspects
  social: {
    groupSize?: number;
    familyFriendly: boolean;
    accessibility: string[];          // ['wheelchair', 'stroller']
    petFriendly: boolean;
  };

  // Activity-Specific Equipment
  equipment: {
    required: {
      bike?: BikeEquipment;
      ski?: SkiEquipment;
      run?: RunEquipment;
    };
    recommended: string[];
    optional: string[];
  };

  // Activity Variations & Features
  activityDetails: {
    primary: {
      type: string;
      variation: ActivityVariation;
      difficulty: string;
      technicalGrade?: string;
    };
    secondary?: {
      type: string;
      variation: ActivityVariation;
      difficulty: string;
    }[];
  };

  // Terrain Characteristics
  terrain: {
    primary: string;
    secondary: string[];
    features: string[];
    hazards: string[];
    seasonal: {
      best: string[];
      acceptable: string[];
      avoid: string[];
    };
  };

  // Skill Requirements
  skillRequirements: {
    minimum: string;
    recommended: string;
    technical: string[];
    physical: string[];
  };

  // Travel Comfort
  travelComfort: TravelComfort;
}

export interface RouteWaypoint {
  type: WaypointType;
  location: LatLng;
  name: string;
  details?: {
    parking?: boolean;
    facilities?: string[];
    hours?: string;
  };
}

export interface CombinedRoute {
  id: string;
  name: string;
  type: RouteSegmentType;
  segments: RouteSegment[];
  metadata: RouteMetadata;
  waypoints: RouteWaypoint[];
  vectorData?: {
    embedding: number[];
    description: string;
    lastUpdated: Date;
  };
}

export interface TravelComfort {
  driving: {
    maxContinuousDriving: number;     // minutes
    preferredRestFrequency: number;    // minutes
    preferredRestDuration: number;     // minutes
    preferredStopTypes: string[];      // ['restaurant', 'rest-area', 'scenic-viewpoint']
    avoidStopTypes: string[];         // ['truck-stop', 'urban-area']
    timeOfDayPreferences: {
      preferred: string[];            // ['morning', 'afternoon']
      avoid: string[];               // ['rush-hour', 'late-night']
    };
  };
  
  packingPreferences: {
    tripDurationThresholds: {
      dayTrip: {
        maxHours: number;
        essentials: string[];
      };
      overnight: {
        essentials: string[];
        recommended: string[];
      };
      multiDay: {
        essentials: string[];
        recommended: string[];
        optional: string[];
      };
    };
    activitySpecific: {
      [key: string]: {               // 'ski', 'bike', 'hike', etc.
        essential: string[];
        recommended: string[];
        weather: {
          cold: string[];
          hot: string[];
          rain: string[];
        };
      };
    };
  };

  comfort: {
    temperature: {
      preferred: [number, number];    // [min, max] in celsius
      tolerable: [number, number];
    };
    weather: {
      preferred: string[];           // ['sunny', 'partly-cloudy']
      tolerable: string[];          // ['light-rain', 'overcast']
      avoid: string[];              // ['heavy-rain', 'storm']
    };
    terrain: {
      preferred: string[];          // ['paved', 'gravel']
      avoid: string[];             // ['steep-incline', 'technical']
    };
  };

  amenities: {
    required: string[];             // ['restrooms', 'water']
    preferred: string[];           // ['cafe', 'bike-shop']
    nice: string[];               // ['shower', 'bike-wash']
  };
}