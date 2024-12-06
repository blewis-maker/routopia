import { GeoPoint } from '../geo';
import { ActivityType } from '../activity';

export interface POIRecommendation {
  id: string;
  name: string;
  type: POIType;
  location: GeoPoint;
  rating: number;
  distance: number;
  openNow?: boolean;
  openingHours?: OpeningHours;
  activities: ActivityType[];
  amenities: string[];
  photos?: string[];
  description?: string;
  popularity?: {
    current: number;
    typical: number;
    nextHour: number;
  };
  weather?: {
    current: string;
    forecast: string;
  };
}

export type POIType = 
  | 'restaurant'
  | 'cafe'
  | 'park'
  | 'museum'
  | 'landmark'
  | 'shop'
  | 'sports'
  | 'entertainment'
  | 'transit'
  | 'parking'
  | 'rest_area'
  | 'viewpoint'
  | 'other';

export interface OpeningHours {
  periods: {
    day: number;
    open: string;
    close: string;
  }[];
  isOpen: boolean;
  nextOpen?: string;
  nextClose?: string;
}

export interface POISearchParams {
  location: GeoPoint;
  radius: number;
  type?: POIType[];
  activities?: ActivityType[];
  minRating?: number;
  openNow?: boolean;
  limit?: number;
}

export interface POISearchResult {
  pois: POIRecommendation[];
  total: number;
  nextPage?: string;
} 