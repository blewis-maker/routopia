import { ActivityType } from './activity';

export enum POICategory {
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  HOTEL = 'HOTEL',
  PARKING = 'PARKING',
  VIEWPOINT = 'VIEWPOINT',
  TRAILHEAD = 'TRAILHEAD',
  SKI_LIFT = 'SKI_LIFT',
  BIKE_RENTAL = 'BIKE_RENTAL',
  CHARGING_STATION = 'CHARGING_STATION'
}

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  details?: {
    description?: string;
    openingHours?: string;
    amenities?: string[];
    pricing?: {
      level: 'budget' | 'moderate' | 'premium';
      currency: string;
      range: [number, number];
    };
  };
  recommendedActivities?: ActivityType[];
  realtime?: {
    crowdLevel?: 'low' | 'moderate' | 'high';
    waitTime?: number;
    availability?: number;
    lastUpdate: number;
  };
}

export interface POISearchResult {
  results: POI[];
  metadata: {
    total: number;
    radius: number;
    categories: POICategory[];
    searchTime: number;
  };
}

export interface POIFilter {
  categories?: POICategory[];
  rating?: number;
  priceLevel?: ('budget' | 'moderate' | 'premium')[];
  activities?: ActivityType[];
  openNow?: boolean;
  hasParking?: boolean;
  isAccessible?: boolean;
} 