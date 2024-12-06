export enum POICategory {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  PARK = 'park',
  MUSEUM = 'museum',
  SHOP = 'shop',
  HOTEL = 'hotel',
  SKI_LIFT = 'ski_lift',
  SKI_RUN = 'ski_run',
  LODGE = 'lodge',
  SERVICE = 'service'
}

export interface POILocation {
  lat: number;
  lng: number;
}

export interface POIRatings {
  overall: number;
  aspects?: {
    safety?: number;
    accessibility?: number;
    familyFriendly?: number;
  };
}

export interface POIDetails {
  description?: string;
  openingHours: string;
  pricing?: {
    level: 'budget' | 'moderate' | 'premium';
    currency: string;
    range: [number, number];
  };
  amenities: string[];
  ratings?: POIRatings;
}

export interface POIRecommendation {
  id: string;
  name: string;
  location: POILocation;
  category: POICategory;
  recommendedActivities: string[];
  confidence: number;
  details: POIDetails;
}

export interface POISearchResult {
  results: POIRecommendation[];
  metadata: {
    total: number;
    radius: number;
    categories: POICategory[];
    searchTime: number;
  };
}

export interface POISearchRequest {
  location: POILocation;
  radius: number;
  categories?: POICategory[];
  activityType?: string;
  maxResults?: number;
} 